import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState(() => ({
    customer: searchParams.get("customer") || "",
    phoneNumber: searchParams.get("phoneNumber") || "",
    amount: searchParams.get("amount") || "2700.00",
  }));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const customerValue = formData.customer.trim();
    const phoneValue = formData.phoneNumber.trim();
    const amountValue = parseFloat(formData.amount);

    if (!customerValue) {
      setError("Customer name is required");
      setIsLoading(false);
      return;
    }

    if (!phoneValue) {
      setError("Phone number is required");
      setIsLoading(false);
      return;
    }

    if (!amountValue || amountValue <= 0) {
      setError("Valid amount is required");
      setIsLoading(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        customer: customerValue,
        phoneNumber: phoneValue,
        amount: amountValue.toString(),
      });

      const response = await apiFetch(`api/payment/general-payment?${queryParams}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.errors
          ? Object.values(errorData.errors).flat().join(", ")
          : errorData.message || "Payment failed. Please try again.";
        throw new Error(errorMessage);
      }

      const data = await response.json();

      const redirectUrl = data.redirectUrl || data.url || data.paymentUrl || data.message;

      if (redirectUrl && (redirectUrl.includes("pesapal") || redirectUrl.startsWith("http"))) {
        setSuccess("Redirecting to payment processor...");
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      } else {
        setSuccess(data.message || "Payment processed successfully!");
        setIsLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process payment. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <BackButton fallbackPath="/" />
      </div>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="border border-logo-blue/20 shadow-lg bg-gradient-to-br from-card via-card to-card/95">
              <CardHeader className="text-center">
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-logo-blue to-logo-gold bg-clip-text text-transparent">Pay to secure your spot</CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer" className="text-foreground font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="customer"
                      name="customer"
                      type="text"
                      placeholder="Enter full name"
                      value={formData.customer}
                      onChange={handleChange}
                      required
                      className="border-logo-blue/30 bg-logo-blue/5 focus:border-logo-blue focus:ring-logo-blue/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-foreground font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="border-logo-blue/30 bg-logo-blue/5 focus:border-logo-blue focus:ring-logo-blue/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Amount
                    </Label>
                    <p className="text-lg font-bold text-foreground">
                      KES {formData.amount || "2700.00"}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 text-sm">
                      {success}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium h-11"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Processing..." : "Pay Now"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Payment;
