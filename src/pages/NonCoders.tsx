import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { WaitingListForm } from "@/components/WaitingListForm";

const NonCoders = () => {
  const [showForm, setShowForm] = useState(false);
  const [showMentorLogin, setShowMentorLogin] = useState(false);
  const [mentorEmail, setMentorEmail] = useState("");
  const [mentorPassword, setMentorPassword] = useState("");
  const [mentorError, setMentorError] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);
  const navigate = useNavigate();

  const handleMentorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMentorError("");
    setMentorLoading(true);

    // Validate credentials
    if (mentorEmail === "mentor@skillgo.africa" && mentorPassword === "31010038") {
      setShowMentorLogin(false);
      setMentorEmail("");
      setMentorPassword("");
      navigate("/ai-incubator");
    } else {
      setMentorError("Invalid email or password");
    }

    setMentorLoading(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      const formSection = document.getElementById("join-form");
      if (formSection) {
        formSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <BackButton fallbackPath="/" />
      </div>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-logo-blue/5 via-background to-logo-gold/15">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-logo-blue/30 bg-logo-blue/5 px-4 py-2 text-sm font-medium text-logo-blue backdrop-blur-sm mb-6">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              For Non-Coders
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-8 bg-gradient-to-r from-logo-blue to-logo-gold bg-clip-text text-transparent leading-tight px-6 py-4 rounded-lg bg-logo-gold/15">
              Ready to show the world how you think?
            </h1>
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
                  Skillgo.africa is now open to AI professionals worldwide. Create your profile, showcase your projects, and let your verified evidence profile do the talking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Ways to Join Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-logo-blue to-logo-gold bg-clip-text text-transparent mb-12 text-center px-6 py-4 rounded-lg bg-logo-gold/15 inline-block w-full">
              Two Ways to Join
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Option 1 */}
              <Card className="border-2 border-logo-blue/30 hover:border-logo-blue/60 transition-all hover:shadow-lg bg-gradient-to-br from-white via-logo-blue/5 to-white">
                <CardContent className="p-8 text-center">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-logo-blue/15">
                    <span className="text-lg font-bold text-logo-blue">1</span>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-logo-blue to-logo-blue/70 bg-clip-text text-transparent mb-4">
                    Join as Independent Talent
                  </h3>
                  <p className="text-foreground/80 leading-relaxed mb-6">
                    Already building AI projects? Create your profile, upload your work, and go through the thought-process interview to get verified.
                  </p>
                  <div className="space-y-2 text-sm text-foreground/70">
                    <p className="font-semibold text-foreground">What you get:</p>
                    <ul className="space-y-1 flex flex-col items-center w-full">
                      <li className="flex flex-col items-center w-full">
                        <CheckCircle2 className="h-4 w-4 text-logo-blue flex-shrink-0 mb-1" />
                        <span className="block text-center">Verified profile</span>
                      </li>
                      <li className="flex flex-col items-center w-full">
                        <CheckCircle2 className="h-4 w-4 text-logo-blue flex-shrink-0 mb-1" />
                        <span className="block text-center">Showcase your projects</span>
                      </li>
                      <li className="flex flex-col items-center w-full">
                        <CheckCircle2 className="h-4 w-4 text-logo-blue flex-shrink-0 mb-1" />
                        <span className="block text-center">Access to opportunities</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Option 2 */}
              <Card className="border-2 border-logo-gold/30 hover:border-logo-gold/60 transition-all hover:shadow-lg flex flex-col bg-gradient-to-br from-white via-logo-gold/10 to-white">
                <CardContent className="p-8 flex flex-col flex-1 text-center">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-logo-gold/15 mx-auto">
                    <span className="text-lg font-bold text-logo-gold">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">
                    Join via the Incubator
                  </h3>
                  <p className="text-foreground/80 leading-relaxed mb-6">
                    Want structured support to build projects before showcasing them? Apply to the Skillgo.africa AI Incubator — a guided programme that prepares you for the marketplace.
                  </p>
                  <div className="space-y-2 text-sm text-foreground/70 mb-6">
                    <p className="font-semibold text-foreground">What you get:</p>
                    <ul className="space-y-1 flex flex-col items-center w-full">
                      <li className="flex flex-col items-center w-full">
                        <CheckCircle2 className="h-4 w-4 text-logo-gold flex-shrink-0 mb-1" />
                        <span className="block text-center">Guided learning path</span>
                      </li>
                      <li className="flex flex-col items-center w-full">
                        <CheckCircle2 className="h-4 w-4 text-logo-gold flex-shrink-0 mb-1" />
                        <span className="block text-center">Build real projects</span>
                      </li>
                      <li className="flex flex-col items-center w-full">
                        <CheckCircle2 className="h-4 w-4 text-logo-gold flex-shrink-0 mb-1" />
                        <span className="block text-center">Verified upon completion</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-3 mt-auto w-full">
                    <Button onClick={scrollToForm} className="bg-blue-900 text-white hover:bg-logo-gold w-full">
                      Choose a cohort
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button onClick={() => navigate("/payment")} className="bg-logo-gold/10 border border-logo-gold/30 hover:bg-logo-gold/20 hover:border-logo-gold/50 text-foreground w-full transition-colors">
                      Pay directly
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Login Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-background via-logo-blue/2 to-logo-gold/2">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 px-6 py-4 rounded-lg bg-logo-gold/15 inline-block">
              Already a mentor or coach?
            </h3>
            <p className="text-foreground/70 mb-8">
              Access the AI Incubator dashboard to manage cohorts and mentees.
            </p>
            <Button onClick={() => setShowMentorLogin(true)} className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white px-8 py-6 text-base font-bold">
              Login as a mentor
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Join Form Section */}
      {showForm && (
        <section id="join-form" className="py-12 sm:py-16 bg-gradient-to-br from-logo-blue/5 via-background to-logo-gold/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-950 p-8 rounded-lg shadow-xl border-2 border-logo-gold/20 relative">
                <button
                  onClick={() => setShowForm(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close form"
                >
                  <X className="h-5 w-5 text-foreground/60 hover:text-foreground" />
                </button>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-logo-blue to-logo-gold bg-clip-text text-transparent mb-2 text-center">
                  Choose a Cohort
                </h2>
                <p className="text-sm text-foreground/70 text-center mb-6">
                  Fill in your details to get started with Skillgo.africa
                </p>
                <WaitingListForm />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Mentor Login Modal */}
      {showMentorLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-950 rounded-lg shadow-xl max-w-md w-full relative">
            <button
              onClick={() => {
                setShowMentorLogin(false);
                setMentorEmail("");
                setMentorPassword("");
                setMentorError("");
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close form"
            >
              <X className="h-5 w-5 text-foreground/60 hover:text-foreground" />
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-logo-blue to-logo-gold bg-clip-text text-transparent mb-2 text-center">
                Mentor Login
              </h2>
              <p className="text-sm text-foreground/70 text-center mb-6">
                Access the AI Incubator dashboard
              </p>

              <form onSubmit={handleMentorLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="mentor-email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="mentor-email"
                    type="email"
                    placeholder="Enter your email"
                    value={mentorEmail}
                    onChange={(e) => setMentorEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-logo-blue/30 rounded-lg bg-logo-blue/5 focus:outline-none focus:border-logo-blue focus:ring-2 focus:ring-logo-blue/20 transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mentor-password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <input
                    id="mentor-password"
                    type="password"
                    placeholder="Enter your password"
                    value={mentorPassword}
                    onChange={(e) => setMentorPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-logo-blue/30 rounded-lg bg-logo-blue/5 focus:outline-none focus:border-logo-blue focus:ring-2 focus:ring-logo-blue/20 transition-all"
                    required
                  />
                </div>

                {mentorError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-200 text-sm">
                    {mentorError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={mentorLoading}
                  className="w-full bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white font-semibold py-2"
                >
                  {mentorLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default NonCoders;
