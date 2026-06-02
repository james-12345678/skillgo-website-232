import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { ArrowRight, Eye } from "lucide-react";

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <BackButton fallbackPath="/" />
      </div>

      {/* Hero Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-logo-blue/30 bg-logo-blue/10 px-4 py-2 text-sm font-medium text-logo-blue backdrop-blur-sm mb-6">
              <Eye className="mr-2 h-4 w-4 text-logo-blue" />
              Who We Are
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8 bg-gradient-to-r from-blue-800 to-logo-gold bg-clip-text text-transparent leading-tight">
              The marketplace that goes deeper than the portfolio.
            </h1>
          </div>
        </div>
      </section>

      {/* Who We Are - Main Content */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Card 1: The Market Problem */}
            <div className="p-6 rounded-lg bg-white border border-logo-blue/20" style={{backgroundColor: 'rgba(59, 130, 246, 0.02)'}}>
              <h3 className="text-base font-bold text-logo-blue mb-3">The Market Problem</h3>
              <p className="text-xs sm:text-sm text-foreground/70 leading-loose">
                CVs and portfolios are no longer enough. Employers need a deeper signal, one that reveals how AI talent thinks, solves problems, and performs when critical decisions matter most.
              </p>
            </div>

            {/* Card 2: The Solution */}
            <div className="p-6 rounded-lg bg-white border border-logo-gold/20" style={{backgroundColor: 'rgba(251, 191, 36, 0.02)'}}>
              <h3 className="text-base font-bold text-black mb-3">The Solution</h3>
              <p className="text-xs sm:text-sm text-foreground/70 leading-loose">
                Skillgo.africa was built to help capable people prove their value with dignity, clarity, and confidence in a world that often asks for proof but gives little chance to show it.
              </p>
            </div>

            {/* Card 3: The Platform */}
            <div className="p-6 rounded-lg bg-white border border-logo-blue/20" style={{backgroundColor: 'rgba(59, 130, 246, 0.02)'}}>
              <h3 className="text-base font-bold text-logo-blue mb-3">The Platform</h3>
              <p className="text-xs sm:text-sm text-foreground/70 leading-loose">
                Skillgo.africa is the Global AI Talent Market where professionals showcase real projects and are evaluated on the thinking, reasoning, and judgment behind their work. This creates a verified evidence profile that captures real capability beyond certificates or portfolios.
              </p>
            </div>

            {/* Card 4: The Value */}
            <div className="p-6 rounded-lg bg-white border border-logo-gold/20" style={{backgroundColor: 'rgba(251, 191, 36, 0.02)'}}>
              <h3 className="text-base font-bold text-black mb-3">The Value</h3>
              <p className="text-xs sm:text-sm text-foreground/70 leading-loose">
                For talent, it is the clearest way to stand out in a crowded global market. For employers, it is the most reliable signal they have ever had access to before making a hire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founding Training Partners Card */}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding text-center" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-logo-gold bg-clip-text text-transparent mb-4">Founding Training Partners:</h3>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                Skillgo.africa is partnered with AI builder Trainers across Africa to ensure a strong, continuously growing pipeline of verified talent enters the marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-800 to-logo-gold bg-clip-text text-transparent mb-8">Ready to be part of the change?</h2>
            <Button asChild size="lg" className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white px-8 py-6 text-base font-bold shadow-lg">
              <Link to="/signin" className="flex items-center justify-center">
                Get Started
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

export default AboutUs;
