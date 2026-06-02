import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { ArrowRight, Eye } from "lucide-react";

const HowItWorks = () => {
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
            <div className="inline-flex items-center rounded-full border bg-background/60 px-4 py-2 text-sm font-medium text-foreground/80 backdrop-blur-sm mb-6">
              <Eye className="mr-2 h-4 w-4 text-logo-blue" />
              The Process
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8 text-foreground leading-tight">
              Build. Showcase.
              <br />
              <span className="bg-gradient-to-r from-logo-blue to-logo-gold bg-clip-text text-transparent">
                Get verified. Get hired.
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* Step 1 */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">Step 1:
              <span className="text-logo-blue"> Showcase Your Projects</span>
            </h2>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="p-6 rounded-lg bg-white border border-logo-blue/20 text-center" style={{backgroundColor: 'rgba(59, 130, 246, 0.02)'}}>
              <h3 className="text-sm font-bold text-logo-blue mb-3">Built Something?</h3>
              <p className="text-sm text-foreground/70 leading-loose">
                Bring it. Whether it is a personal project, freelance work, open source contribution, research, or a side build, upload it directly to your profile. Real work only. No templates. No gatekeeping. If you built it, it belongs here.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-lg bg-white border border-logo-gold/20 text-center" style={{backgroundColor: 'rgba(251, 191, 36, 0.02)'}}>
              <h3 className="text-sm font-bold text-black mb-3">Multiple Projects?</h3>
              <p className="text-sm text-foreground/70 leading-loose">
                Great, showcase all of them. The more verified projects on your profile, the stronger your signal to employers.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-lg bg-white border border-logo-blue/20 text-center" style={{backgroundColor: 'rgba(59, 130, 246, 0.02)'}}>
              <h3 className="text-sm font-bold text-logo-blue mb-3">No Projects Yet?</h3>
              <p className="text-sm text-foreground/70 leading-loose">
                No problem. The Skillgo.africa AI Incubator guides you through real project-building from start to finish. Everything built in the incubator goes straight onto your marketplace profile — ready to be verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">Step 2:
              <span className="text-black"> The Thought Process Interview</span>
            </h2>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="p-6 rounded-lg bg-white border border-logo-gold/20 text-center" style={{backgroundColor: 'rgba(251, 191, 36, 0.02)'}}>
              <h3 className="text-sm font-bold text-black mb-3">The Interview Process</h3>
              <p className="text-sm text-foreground/70 leading-loose">
                This is where Skillgo.africa is unlike any other platform. For each project you showcase, whether built independently or through the incubator, you go through a structured interview. Not to test memory, but to capture how you think.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-lg bg-white border border-logo-gold/20 text-center" style={{backgroundColor: 'rgba(251, 191, 36, 0.02)'}}>
              <h3 className="text-sm font-bold text-black mb-3">Your Thinking Matters</h3>
              <p className="text-sm text-foreground/70 leading-loose">
                How did you approach the problem? What decisions did you make and why? How did you handle failure or uncertainty? These are the questions that reveal how you actually think.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-lg bg-white border border-logo-gold/20 text-center" style={{backgroundColor: 'rgba(251, 191, 36, 0.02)'}}>
              <h3 className="text-sm font-bold text-black mb-3">Verified Proof</h3>
              <p className="text-sm text-foreground/70 leading-loose">
                These interview signals are verified and attached to your project, giving employers a window into your mind that no portfolio ever could.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}>
              <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Step 3:
              <span className="text-logo-blue"> Get Discovered Globally</span>
            </h2>
              <div className="space-y-4 text-base sm:text-lg text-foreground/80 leading-relaxed text-center">
                <p>
                  Your verified profile is live on the Global AI Talent Market — actively visible to employers worldwide who are looking for exactly what you offer. Not just your output. Your thinking. Your process. Your proof.
                </p>
              </div>
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
              <span className="text-logo-blue"> get started</span>?
            </h2>
            <Button asChild size="lg" className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white px-8 py-6 text-base font-bold shadow-lg">
              <Link to="/signin" className="flex items-center justify-center">
                Join the Market
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

export default HowItWorks;
