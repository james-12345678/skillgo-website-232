import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { ArrowRight, TrendingUp } from "lucide-react";

const Investors = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const traction = [
    "17 registered talent profiles in our inaugural cohort",
    "Live marketplace and interview process running now",
    "Strategic training partnership with AI Sprouts Africa",
    "Active global employer pipeline in development",
  ];

  const theAsk = [
    { label: "Scale the marketplace and interview infrastructure", percentage: "40%" },
    { label: "Build our global employer network", percentage: "35%" },
    { label: "Grow our talent pipeline through training partnerships", percentage: "25%" },
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
              <TrendingUp className="mr-2 h-4 w-4 text-logo-blue" />
              The Opportunity
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8 text-foreground leading-tight">
              Back the market that goes
              <br />
              <span className="bg-gradient-to-r from-logo-blue to-logo-gold bg-clip-text text-transparent">
                deeper than the portfolio.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mx-auto">
              There are 1.6 million open AI roles globally. Fewer than 520,000 qualified candidates exist to fill them.
            </p>
          </div>
        </div>
      </section>

      {/* The Story Section */}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}>
              <div className="space-y-4 text-sm sm:text-base text-foreground/80 leading-relaxed">
                <div className="text-center">
                  <h3 className="font-semibold text-logo-blue text-base mb-2">The Story</h3>
                  <p>Employers are hiring blind — relying on CVs, portfolios, and gut feel to make decisions that cost them millions when they get it wrong.</p>
                </div>
                <p className="text-base sm:text-lg text-center text-logo-blue font-semibold">
                  The problem is not the talent. The problem is verification.
                </p>
                <p className="text-center">
                  Skillgo.africa is the Global AI Talent Market built to solve that — the only platform that verifies not just what candidates built, but how they think.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Moat Section */}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Our
              <span className="text-logo-blue"> Moat</span>
            </h2>
            <div className="p-8 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}>
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed text-center">
                Every other platform shows output. Certificates. Portfolios. Code repositories. We go deeper. Through structured project interviews, we capture the reasoning signals behind every project — how candidates think, decide, and solve. You cannot fake that under interview. That is our defensible edge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Traction Section */}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              <span className="text-logo-gold">Traction</span>
            </h2>
            <div className="space-y-4">
              {traction.map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding"
                  style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}
                >
                  <p className="text-xs sm:text-sm text-foreground font-medium text-center flex items-center justify-center gap-2">
                    <span className="text-logo-blue font-bold">✓</span>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Ask Section */}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              The
              <span className="text-logo-gold"> Ask</span>
            </h2>
            <div className="mb-8 p-8 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}>
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                We are raising <span className="font-semibold text-logo-blue">$50,000 – $250,000</span> in blended grants and early-stage investment to:
              </p>
            </div>
            <div className="space-y-4">
              {theAsk.map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding"
                  style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <p className="text-xs sm:text-sm text-foreground font-medium">
                      {item.label}
                    </p>
                    <span className="text-logo-gold font-bold text-sm">{item.percentage}</span>
                  </div>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
              Ready to
              <span className="text-logo-gold"> invest</span>?
            </h2>
            <Button asChild size="lg" className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white px-8 py-6 text-base font-bold shadow-lg">
              <Link to="/contact" className="flex items-center justify-center">
                Request Our Investor Brief
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

export default Investors;
