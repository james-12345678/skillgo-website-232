import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignUpForm from "@/components/auth/SignUpForm";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/forensic-app");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-logo-blue/5 to-logo-blue/10 flex items-center justify-center p-4 sm:p-6">
      {/* Back Button and Logo */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground hover:bg-logo-blue/10 min-h-[44px] min-w-[44px] px-3 py-2 text-xs sm:text-sm z-20 transition-colors duration-100"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-0 sm:mr-2 flex-shrink-0" />
          <span className="sr-only sm:not-sr-only sm:inline">Back</span>
        </Button>
      </div>

      <Card className="w-full max-w-sm sm:max-w-lg mx-auto border-2 border-transparent bg-gradient-to-r from-logo-blue/20 via-logo-blue/40 to-logo-blue/20 p-[2px] rounded-lg shadow-2xl shadow-logo-blue/20">
        <div className="bg-card rounded-[6px] h-full w-full">
          <CardHeader className="text-center px-3 pt-3 pb-1 sm:px-8 sm:pt-4 sm:pb-1">
            <div className="flex items-center justify-center mb-2">
              <img
                src="/skillgo-logo.svg"
                alt="SkillGo"
                className="h-20 sm:h-28 object-contain"
              />
            </div>
          </CardHeader>

          <CardContent className="px-3 pt-0.5 pb-2 sm:px-8 sm:pt-1 sm:pb-4">
            <SignUpForm />
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;
