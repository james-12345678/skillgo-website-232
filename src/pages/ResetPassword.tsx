import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { validatePassword } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Check, X } from "lucide-react";

const ResetPassword = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const isLinkValid = Boolean(email && token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (!passwordValidation.isValid) {
      const failedRules = Object.entries(passwordValidation.rules)
        .filter(([_, rule]) => !rule.isValid)
        .map(([_, rule]) => rule.message)
        .join("\n• ");
      setError(`Password must meet the following criteria:\n• ${failedRules}`);
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please enter the same password in both fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiFetch("api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          newPassword,
          confirmPassword,
        }),
      });

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json().catch(() => ({}));
      } else {
        data = { message: await response.text().catch(() => "") };
      }

      if (response.ok) {
        const message = data?.message || "Password reset successful.";
        setSuccess(message);
        toast({
          title: "Success!",
          description: message,
        });
        return;
      }

      let message: string;

      if (response.status === 400) {
        message = "Password does not meet the required criteria. Please ensure it has at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).";
      } else {
        message = data?.message || data?.error || `Password reset failed (${response.status}).`;
      }

      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } catch (err) {
      const message = "A network error occurred. Please try again.";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-logo-blue/5 to-logo-blue/10 flex items-center justify-center p-4 sm:p-6 font-poppins">
      <Card className="w-full max-w-md border-2 border-transparent bg-gradient-to-r from-logo-blue/20 via-logo-blue/40 to-logo-blue/20 p-[2px] rounded-lg shadow-2xl shadow-logo-blue/20">
        <div className="bg-card rounded-[6px] h-full w-full">
          <CardHeader className="text-center px-4 pt-6 pb-2 sm:px-8">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              {isLinkValid
                ? `Create a new password for ${email}`
                : "This reset link is missing email or token information."}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 pb-6 sm:px-8">
            {!isLinkValid ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  The reset link is invalid or expired.
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white font-bold">
                  <Link to="/forgot-password">Request a new reset link</Link>
                </Button>
              </div>
            ) : success ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                  {success}
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white font-bold">
                  <Link to="/signin">Go to Sign In</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 whitespace-pre-line">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    {Object.entries(passwordValidation.rules).map(([key, rule]) => (
                      <div key={key} className="flex items-center gap-2">
                        {rule.isValid ? (
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                        )}
                        <span className={rule.isValid ? "text-green-600" : "text-red-600"}>
                          {rule.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  {confirmPassword.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      {passwordsMatch ? (
                        <>
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                          <span className="text-red-600">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
