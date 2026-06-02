import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { CheckCircle2 } from "lucide-react";

const Payments = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-gradient-to-r from-logo-blue/5 to-logo-gold/5 border-b border-logo-blue/10">
        <div className="container mx-auto px-4 py-6">
          <BackButton fallbackPath="/home" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />

          <p className="text-lg text-foreground/80">
            Skillgo Verify has received your payment. You will be assigned a mentor in the upcoming cohort. Expect to hear from us within three working days.
          </p>

          <Button
            onClick={() => navigate("/home")}
            className="w-full bg-gradient-to-r from-logo-blue to-logo-gold text-white font-semibold py-6"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payments;
