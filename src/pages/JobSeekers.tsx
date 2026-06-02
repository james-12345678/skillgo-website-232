import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { ArrowRight, Briefcase } from "lucide-react";

const JobSeekers = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const whatYouGet = [
    "A verified global talent profile",
    "Project showcases visible to employers worldwide",
    "Thought-process interviews that set you apart",
    "Direct discovery by top global employers",
    "Optional access to the AI Incubator if you want guided project support",
  ];

  const whoShouldJoin = [
    "AI professionals at any career stage",
    "Developers, data scientists, ML engineers, AI researchers",
    "Career switchers with real AI project experience",
    "Graduates ready to showcase what they have built",
    "Anyone who wants the world to see how they think",
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
              <Briefcase className="mr-2 h-4 w-4 text-logo-blue" />
              Prove Your Thinking
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8 text-foreground leading-tight">
              Your thinking is your most valuable asset.
              <br />
              <span className="bg-gradient-to-r from-logo-blue to-logo-gold bg-clip-text text-transparent">
                Now you can prove it.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mx-auto">
              You have built things. Real things. But your CV looks like everyone else's and your portfolio gets lost in the noise.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}>
              <div className="space-y-4 text-sm sm:text-base text-foreground/80 leading-relaxed">
                <p className="text-base sm:text-lg text-center text-logo-blue font-semibold">
                  Skillgo.africa gives your work the verification it deserves.
                </p>
                <p>
                  Showcase your projects on the global marketplace, go through a structured thought-process interview for each one, and build an evidence profile that shows the world not just what you made — but how you think. That is what gets you hired.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              What
              <span className="text-logo-blue"> You Get</span>
            </h2>
            <div className="space-y-4">
              {whatYouGet.map((benefit, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border-2 border-transparent bg-clip-padding"
                  style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, rgb(59, 130, 246, 0.1), rgb(251, 191, 36, 0.1))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box'}}
                >
                  <p className="text-xs sm:text-sm text-foreground font-medium text-center flex items-center justify-center gap-2">
                    <span className="text-logo-blue font-bold">✓</span>
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Join Section */}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Who Should
              <span className="text-logo-gold"> Join</span>
            </h2>
            <div className="space-y-4">
              {whoShouldJoin.map((item, index) => (
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

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
              Ready to
              <span className="text-logo-blue"> showcase your work</span>?
            </h2>
            <Button asChild size="lg" className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white px-8 py-6 text-base font-bold shadow-lg">
              <Link to="/signin" className="flex items-center justify-center">
                Showcase Your Work
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

export default JobSeekers;
