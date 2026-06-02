import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Sparkles, Bell, ArrowRight } from "lucide-react";
import { useState } from "react";

interface ComingSoonDialogProps {
  children: React.ReactNode;
  feature: string;
}

const ComingSoonDialog = ({ children, feature }: ComingSoonDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-h-[90vh] overflow-y-auto sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-logo-blue" />
            <span>Coming Soon</span>
          </DialogTitle>
          <DialogDescription>
            {feature} is currently under development
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-logo-blue/5 to-logo-blue/5 border-logo-blue/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-logo-blue/20 to-logo-blue/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-logo-blue" />
              </div>

              <h3 className="text-sm font-bold mb-2">
                {feature} is Coming Soon!
              </h3>

              <p className="text-muted-foreground mb-4 leading-relaxed text-xs">
                {feature === "Forensic Workbench" ? (
                  "This is coming soon after you audit your work. Your workbench will be available once your Evidence Log reaches sufficient maturity through our verification programs."
                ) : (
                  <>
                    We're working hard to bring you the most advanced{" "}
                    {feature.toLowerCase()} experience. This feature will be
                    available once your Evidence Log reaches sufficient maturity
                    through our verification programs.
                  </>
                )}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <Bell className="h-3 w-3" />
                  <span>You'll be notified when it's ready</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonDialog;
