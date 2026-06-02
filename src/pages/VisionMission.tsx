import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { ArrowRight, Target, Eye } from "lucide-react";

const VisionMission = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <BackButton fallbackPath="/about" />
      </div>

      {/* Hero Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border bg-background/60 px-4 py-2 text-sm font-medium text-foreground/80 backdrop-blur-sm mb-6">
              <Eye className="mr-2 h-4 w-4 text-logo-blue" />
              Our Direction
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-br from-logo-blue to-logo-gold bg-clip-text text-transparent">
                Vision & Mission
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base text-muted-foreground mb-8 leading-relaxed">
              Guiding our Journey
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg bg-blue-50/50 border border-blue-200/30 dark:bg-blue-950/20 dark:border-blue-800/30 text-center">
                <div className="flex flex-col items-center gap-3 mb-4">
                  <Target className="h-6 w-6 text-logo-blue" />
                  <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">Our Mission</h3>
                </div>
                <p className="text-sm text-foreground font-normal leading-relaxed">
                  To strengthen how skills are built, measured, and trusted in the AI era by turning real-world work into clear, verifiable proof of ability.
                </p>
              </div>

              <div className="p-8 rounded-lg bg-cyan-50/50 border border-cyan-200/30 dark:bg-cyan-950/20 dark:border-cyan-800/30 text-center">
                <div className="flex flex-col items-center gap-3 mb-4">
                  <Eye className="h-6 w-6 text-logo-blue" />
                  <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">Our Vision</h3>
                </div>
                <p className="text-sm text-foreground font-normal leading-relaxed">
                  An economy where skills are easier to see, easier to trust, and better understood—so talent is recognized for what it can actually do.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Alignment */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-foreground mb-12">
              How We're Getting There
            </h2>

            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="p-6 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">Evidence Over Claims</h3>
                <p className="text-foreground/70">We replace credentials with verified proof. Your actual work proves your competence.</p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">Real-Time Verification</h3>
                <p className="text-foreground/70">We audit your actual tool usage, not tests or assumptions. Real work, real proof.</p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">Privacy & Control</h3>
                <p className="text-foreground/70">You control what's shared. We audit patterns, not your personal content.</p>
              </div>

              <div className="p-6 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">Always Evolving</h3>
                <p className="text-foreground/70">Your Evolving CV updates as you and the AI landscape evolve. Static credentials can't keep up.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Ready to Be Part of This Future?
            </h2>
            <p className="text-lg text-foreground/70 mb-8">
              Join us in building the evidence economy
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white border-none px-8 py-6 text-base font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
            >
              <Link to="/signin" className="flex items-center">
                Get Verified Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VisionMission;
