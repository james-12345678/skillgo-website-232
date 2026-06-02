import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Mail } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      navigate("/signin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await apiFetch(
        `api/auth/generate-password-reset-link?email=${encodeURIComponent(email.trim())}`,
        {
          method: "PATCH",
        },
      );

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json().catch(() => ({}));
      } else {
        data = { message: await response.text().catch(() => "") };
      }

      if (response.ok) {
        const successMsg = "reset link has been sent to you email. Kindly login to your email and click it";
        setSuccess(successMsg);
        toast({
          title: "Success!",
          description: successMsg,
        });
        setTimeout(() => navigate("/home"), 5000);
        return;
      }

      const message = data?.message || data?.error || `Request failed (${response.status}). Please try again.`;
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
    <div className="min-h-screen bg-gradient-to-br from-logo-blue/5 to-logo-blue/10 flex items-center justify-center p-4 sm:p-6">
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <>
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-2xl font-bold">Forgot Password</DialogTitle>
              <DialogDescription>
                Enter your email and we&apos;ll send a password reset link.
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {success}
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotPasswordEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="forgotPasswordEmail"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}
          </>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForgotPassword;
