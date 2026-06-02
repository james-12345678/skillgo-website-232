import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignInForm from "@/components/auth/SignInForm";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  React.useEffect(() => {
    if (user) {
      if (String(user.role).toLowerCase() === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/forensic-app");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-logo-blue/5 to-logo-blue/10 flex items-center justify-center p-4 sm:p-6 font-poppins">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
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
          <CardHeader className="text-center px-3 pt-3 pb-1 sm:px-8 sm:pt-6 sm:pb-2">
            <div className="flex items-center justify-center mb-2">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img
                  src="/skillgo-logo.svg"
                  alt="SkillGo"
                  className="h-20 sm:h-28 object-contain"
                />
              </Link>
            </div>
          </CardHeader>

          <CardContent className="px-3 pt-0.5 pb-2 sm:px-8 sm:pt-2 sm:pb-6">
            <SignInForm />

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => navigate("/forgot-password")}
                className="h-auto p-0 text-sm text-logo-blue hover:text-logo-blue/80"
              >
                Forgot Password?
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

    </div>
  );
};

export default SignIn;
