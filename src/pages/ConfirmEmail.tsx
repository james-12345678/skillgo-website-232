import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [emailForResend, setEmailForResend] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!userId || !token) {
        setStatus("error");
        setMessage("Invalid confirmation link. Missing user ID or token.");
        return;
      }

      try {
        const response = await apiFetch(`api/Auth/confirm-email?userId=${userId}&token=${encodeURIComponent(token)}`, {
          method: 'GET',
        });

        // Always try to parse JSON if possible, but handle non-JSON too
        let data;
        try {
          data = await response.json();
        } catch (e) {
          data = { success: response.ok };
        }

        if (response.ok && data.success) {
          setStatus("success");
          setMessage("Your email has been successfully confirmed! You can now log in to your account.");
        } else {
          setStatus("error");
          // If the backend returns success: false and an email, it means the token expired
          const isExpired = !data.success && data.email;
          setMessage(data.message || (isExpired ? "This confirmation link has expired or is invalid." : "Email confirmation failed. The link may have expired or is invalid."));

          if (data.email) {
            setEmailForResend(data.email);
          }
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("A network error occurred. Please try again later.");
      }
    };

    verifyEmail();
  }, [userId, token]);

  const handleResend = async () => {
    if (!emailForResend) return;

    setIsResending(true);
    setResendSuccess(false);

    try {
      const response = await apiFetch('api/Auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: emailForResend }),
      });

      if (response.ok) {
        setResendSuccess(true);
      } else {
        const data = await response.json();
        setMessage(data.message || "Failed to resend confirmation email.");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setMessage("A network error occurred while trying to resend the email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-[60vh] px-4 py-12">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Email Confirmation</CardTitle>
            <CardDescription>
              Verifying your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 pt-4">
            {status === "loading" && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 text-logo-blue animate-spin" />
                <p className="text-muted-foreground font-medium">Please wait while we verify your email...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-green-700">Success!</h3>
                  <p className="text-muted-foreground">{message}</p>
                </div>
                <Button asChild className="w-full mt-4 bg-logo-blue hover:bg-logo-blue/90 text-white font-bold h-10">
                  <Link to="/signin">Go to Sign In</Link>
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-red-100 p-3 rounded-full">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-red-700">Verification Failed</h3>
                  <p className="text-muted-foreground">{message}</p>
                </div>

                {emailForResend && !resendSuccess && (
                  <div className="w-full space-y-4 mt-2">
                    <p className="text-sm text-muted-foreground italic">
                      Don't worry, you can request a new confirmation link.
                    </p>
                    <Button
                      onClick={handleResend}
                      disabled={isResending}
                      className="w-full bg-logo-blue hover:bg-logo-blue/90 text-white font-bold h-10 flex items-center justify-center gap-2"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          Resend Confirmation Email
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {resendSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 w-full">
                    <p className="text-green-800 text-sm font-medium">
                      A new confirmation link has been sent to your email address. Please check your inbox.
                    </p>
                  </div>
                )}

                <Button asChild variant="ghost" className="mt-2 text-logo-blue hover:text-logo-blue/80">
                  <Link to="/signin">Back to Sign In</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default ConfirmEmail;
