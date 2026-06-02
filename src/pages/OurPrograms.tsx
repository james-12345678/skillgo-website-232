import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";

const OurPrograms = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border bg-background/60 px-4 py-2 text-sm font-medium text-foreground/80 backdrop-blur-sm mb-6">
              The Process
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-8 leading-tight">
              From learning to globally verified — in four steps.
            </h1>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Step 1 */}
            <div className="p-8 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-logo-blue to-logo-gold">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-foreground mb-3">Join the Incubator</h3>
                  <p className="text-base text-foreground/80 leading-relaxed">
                    Candidates enroll in the Skillgo.africa AI Incubator Programme. They work on real, structured AI projects that reflect actual employer needs — not theory, not templates.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-logo-blue to-logo-gold">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-foreground mb-3">Build Your Project</h3>
                  <p className="text-base text-foreground/80 leading-relaxed">
                    Every candidate completes hands-on AI projects. They document their process, their decisions, and their outcomes — building a living record of what they can actually do.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-logo-blue to-logo-gold">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-foreground mb-3">The Thought Process Interview</h3>
                  <p className="text-base text-foreground/80 leading-relaxed mb-4">
                    This is where Skillgo.africa is different from every other platform. After each project, every candidate is interviewed — not to test memory, but to capture how they think. How did they approach the problem? What decisions did they make and why? How did they handle failure or uncertainty?
                  </p>
                  <p className="text-base text-foreground/80 leading-relaxed">
                    These interview signals become part of their verified evidence profile.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-8 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-logo-blue to-logo-gold">
                    <span className="text-white font-bold text-lg">4</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-foreground mb-3">Enter the Global Market</h3>
                  <p className="text-base text-foreground/80 leading-relaxed">
                    Candidates with verified evidence profiles are actively matched to employers worldwide. Not just a CV. Not just a portfolio. A proof of thought.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-logo-blue/10 via-white to-logo-gold/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Ready to start your journey?</h2>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white px-8 py-6 text-base font-bold shadow-lg"
            >
              <Link to="/register-cohort" className="flex items-center justify-center">
                Apply to the Incubator
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

export default OurPrograms;
