import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

const PaymentResponse = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");
  const [orderData, setOrderData] = useState<any>(null);

  const orderTrackingId = searchParams.get("OrderTrackingId");
  const orderMerchantReference = searchParams.get("OrderMerchantReference");
  const orderNotificationType = searchParams.get("OrderNotificationType");

  useEffect(() => {
    window.scrollTo(0, 0);

    // Verify payment status with the backend
    const verifyPayment = async () => {
      try {
        if (!orderTrackingId) {
          setStatus("failed");
          return;
        }

        const params = new URLSearchParams();
        params.append("OrderTrackingId", orderTrackingId);
        if (orderMerchantReference) {
          params.append("OrderMerchantReference", orderMerchantReference);
        }
        if (orderNotificationType) {
          params.append("OrderNotificationType", orderNotificationType);
        }

        const response = await apiFetch(
          `api/payment/response-page?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setOrderData(data);
          // Set status based on response
          if (data.status === "success" || data.status === "completed" || data.success === true) {
            setStatus("success");
          } else if (data.status === "pending") {
            setStatus("pending");
          } else {
            setStatus("failed");
          }
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [orderTrackingId, orderMerchantReference, orderNotificationType]);

  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {status === "loading" && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full animate-spin bg-gradient-to-r from-logo-blue to-logo-gold p-1">
                    <div className="w-full h-full bg-background rounded-full"></div>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Processing Your Payment
                </h1>
                <p className="text-foreground/70">
                  Please wait while we verify your payment...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center space-y-6 p-8 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
                    Payment Successful!
                  </h1>
                  <p className="text-green-800 dark:text-green-200 mb-4">
                    Thank you for your enrollment. Your payment has been processed successfully.
                  </p>
                  {orderTrackingId && (
                    <div className="space-y-2">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Order ID: {orderTrackingId}
                      </p>
                      {orderMerchantReference && (
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Reference: {orderMerchantReference}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-4 pt-6">
                  <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-green-200 dark:border-green-900">
                    <p className="font-semibold text-foreground mb-2">What's Next?</p>
                    <p className="text-foreground/70 text-sm">
                      A qualified mentor will be assigned to you shortly. You'll receive their details via email along with your program login credentials and start date.
                    </p>
                  </div>
                  <p className="text-foreground/70">
                    You will receive a confirmation email shortly with your login credentials and program details.
                  </p>
                  <Button
                    onClick={() => navigate("/payments")}
                    className="w-full bg-gradient-to-r from-logo-blue to-logo-gold text-white py-6 font-bold text-base"
                  >
                    Go to Payments
                  </Button>
                </div>
              </div>
            )}

            {status === "pending" && (
              <div className="text-center space-y-6 p-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                    Payment Pending
                  </h1>
                  <p className="text-blue-800 dark:text-blue-200">
                    Your payment is being processed. This may take a few moments.
                  </p>
                </div>
                <div className="space-y-4 pt-6">
                  <p className="text-foreground/70">
                    We will send you a confirmation email once your payment is complete.
                  </p>
                  <Button
                    onClick={() => navigate("/home")}
                    variant="outline"
                    className="w-full py-6 font-bold text-base"
                  >
                    Return to Home
                  </Button>
                </div>
              </div>
            )}

            {status === "failed" && (
              <div className="text-center space-y-6 p-8 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-red-900 dark:text-red-100 mb-2">
                    Payment Failed
                  </h1>
                  <p className="text-red-800 dark:text-red-200">
                    Unfortunately, your payment could not be processed.
                  </p>
                </div>
                <div className="space-y-4 pt-6">
                  <p className="text-foreground/70">
                    Please check your payment details and try again. If the problem persists, contact our support team.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate("/payment")}
                      className="flex-1 bg-gradient-to-r from-logo-gold to-logo-gold text-white py-6 font-bold text-base"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={() => navigate("/home")}
                      variant="outline"
                      className="flex-1 py-6 font-bold text-base"
                    >
                      Go Home
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PaymentResponse;
