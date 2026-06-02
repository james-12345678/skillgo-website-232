import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

const VerifiedMentors = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <BackButton fallbackPath="/forensic-app" />
      </div>

      {/* Coming Soon Section */}
      <section className="flex-1 flex items-center justify-center py-12 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-8 flex justify-center">
              <div className="p-6 bg-logo-gold/10 rounded-full animate-pulse">
                <Rocket className="h-16 w-16 text-logo-gold" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
              <span className="bg-gradient-to-br from-logo-blue to-logo-gold bg-clip-text text-transparent">
                Coming Soon
              </span>
            </h1>
            
            <p className="text-lg text-foreground/70 mb-10 leading-relaxed font-medium">
              We're currently verifying our network of industry mentors to ensure you get the best guidance. Check back soon to connect with verified experts.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-logo-gold to-logo-blue hover:from-logo-gold/90 hover:to-logo-blue/90 text-white px-8 font-bold shadow-lg w-full sm:w-auto"
              >
                <Link to="/forensic-app">Return to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VerifiedMentors;
