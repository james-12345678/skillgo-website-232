import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, Mail } from "lucide-react";

const SignUpSuccess = () => {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-logo-blue/5 to-logo-blue/10 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm sm:max-w-lg mx-auto border-2 border-transparent bg-gradient-to-r from-logo-blue/20 via-logo-blue/40 to-logo-blue/20 p-[2px] rounded-lg shadow-2xl shadow-logo-blue/20">
        <div className="bg-card rounded-[6px] h-full w-full overflow-hidden">
          <CardHeader className="text-center px-6 pt-8 pb-2">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/skillgo-logo.svg"
                alt="SkillGo"
                className="h-20 sm:h-28 object-contain"
              />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="bg-green-100 p-3 rounded-full mb-2">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Registration Successful</h1>
            </div>
          </CardHeader>

          <CardContent className="px-8 pt-4 pb-10 text-center space-y-6">
            <div className="space-y-4">
              <p className="text-lg text-slate-700 font-medium leading-relaxed">
                We’ve sent a confirmation link to your email.
              </p>
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 text-left">
                <Mail className="h-5 w-5 text-logo-blue flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">
                  Please check your inbox and click the link to activate your account.
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default SignUpSuccess;
