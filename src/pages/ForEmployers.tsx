import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { useEffect } from "react";

const ForEmployers = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const benefits = [
    "Access to the Global AI Talent Market — verified profiles",
    "Thought-process evidence profiles attached to real projects",
    "Professionals verified through structured project interviews",
    "Fast, direct matching to your specific role requirements",
    "Early pipeline access through Letters of Intent",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <BackButton fallbackPath="/" />
      </div>

      {/* Hero Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border bg-background/60 px-4 py-2 text-sm font-medium text-foreground/80 backdrop-blur-sm mb-6">
              <Eye className="mr-2 h-4 w-4 text-logo-blue" />
              Hire With Confidence
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8 text-foreground leading-tight">
              Stop guessing. Start knowing how they think.
            </h1>

            <p className="text-base sm:text-lg text-foreground/80 leading-relaxed max-w-3xl mx-auto">
              You have seen the portfolios. You have read the CVs. But you still cannot tell — before the first interview — whether a candidate truly understands AI or just knows how to follow a tutorial.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}>
              <div className="space-y-4 text-base sm:text-lg text-foreground/80 leading-relaxed">
                <p>
                  Skillgo.africa solves that.
                </p>
                <p>
                  Every professional in our marketplace has verified evidence profiles attached to their real projects — showing not just what they built, but how they thought through every decision, challenge, and outcome. You get the signal you need before you ever speak to them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Employers Get Section */}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">What Employers Get</h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding"
                  style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}
                >
                  <p className="text-base sm:text-lg text-foreground font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-8">Ready to start hiring?</h2>
            <Button asChild size="lg" className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white px-8 py-6 text-base font-bold shadow-lg">
              <Link to="/signin" className="flex items-center justify-center">
                Start Hiring
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

export default ForEmployers;
