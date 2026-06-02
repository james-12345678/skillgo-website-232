import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, ChevronDown, LogOut } from "lucide-react";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";

const backgroundImages = [
  "https://cdn.builder.io/api/v1/image/assets%2Fe39e8727be0444c5b02730c71fc0c02e%2Ff40300efd9fb4cf5bff5cbeddad3829f?format=webp&width=1920",
  "https://cdn.builder.io/api/v1/image/assets%2Fe39e8727be0444c5b02730c71fc0c02e%2Fb530c596696c44a59bb0ebb91b112980?format=webp&width=1920",
  "https://cdn.builder.io/api/v1/image/assets%2Fe39e8727be0444c5b02730c71fc0c02e%2F61dc18726ffd448fbe693f8911f10f7d?format=webp&width=1920",
  "https://cdn.builder.io/api/v1/image/assets%2Fe39e8727be0444c5b02730c71fc0c02e%2F677861cf2d394f93ba7c87e631d31943?format=webp&width=1920",
  "https://cdn.builder.io/api/v1/image/assets%2Fe39e8727be0444c5b02730c71fc0c02e%2Fcdb2eb4891d249a9bf21c8eaeda44e59?format=webp&width=1920",
  "https://cdn.builder.io/api/v1/image/assets%2Fe39e8727be0444c5b02730c71fc0c02e%2F3bbe4fda083d4d52a6b7ed02de99443d?format=webp&width=1920",
  "https://cdn.builder.io/api/v1/image/assets%2F7dfd915c8e704c369b323cc5d7ac8d1a%2F50b687a4507049cab74fed64263a36d8?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2F7dfd915c8e704c369b323cc5d7ac8d1a%2F291993f2a9434fb6ae9077dbd4578a2b?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2F7dfd915c8e704c369b323cc5d7ac8d1a%2Fe09dbcfe34784611a9d32d7a67c0d391?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2F7dfd915c8e704c369b323cc5d7ac8d1a%2F9b6ec819dcc44b53b4fb42b2766436f8?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2F7dfd915c8e704c369b323cc5d7ac8d1a%2F0f9966c6238e4b459a0b40c4ac1f2cd2?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2F7dfd915c8e704c369b323cc5d7ac8d1a%2F081324b570f74d7d9e502054b577454c?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2F7dfd915c8e704c369b323cc5d7ac8d1a%2F4738fa780a304ca9a67ef02e408c5622?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2Fe20cf88604984194862dbac391955eb6%2F14445a5cc94c4c05b1d4d09655e841f8?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2Fe20cf88604984194862dbac391955eb6%2Fde72bd3641804097bb710f3f3781662a?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2Fe20cf88604984194862dbac391955eb6%2F14ee4de2f6204f4ab6d82dbf5a42f974?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2Fe20cf88604984194862dbac391955eb6%2F108e203835224a409c411254deeba4a9?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2Fe20cf88604984194862dbac391955eb6%2F2bc64ed89d064c1daca93d01fd8b43ca?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2Fe20cf88604984194862dbac391955eb6%2Ffac6803262494f21a1e0abe208acd4a3?format=webp&width=800&height=1200",
  "https://cdn.builder.io/api/v1/image/assets%2Fe20cf88604984194862dbac391955eb6%2Fb112e13ff38b40e98354f7f258a373c6?format=webp&width=800&height=1200"
];

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const renderSlideshow = () => (
    <div
      className="relative w-full max-w-lg mx-auto aspect-[4/3] sm:aspect-video lg:aspect-[4/3] max-h-[400px] lg:max-h-[500px] min-h-[280px] lg:min-h-[250px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-2xl"
    >
      {backgroundImages.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentBgIndex
              ? "opacity-100 scale-100 z-10"
              : "opacity-0 scale-95 pointer-events-none z-0"
          }`}
        >
          {/* Blurred matching background ambient glow */}
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-40"
            style={{ backgroundImage: `url("${src}")` }}
          />
          {/* Dark overlay for contrast on background glow */}
          <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />

          {/* Sharp foreground image */}
          <div
            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${src}")` }}
          />

          {/* Subtle top-level dark overlay for style consistency */}
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </div>
      ))}
      {/* Navigation Indicators Overlayed at the bottom center of the slideshow */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-nowrap justify-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full max-w-[95%] transition-opacity opacity-80 hover:opacity-100">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBgIndex(index)}
            className={`transition-all duration-300 h-2 rounded-full ${
              index === currentBgIndex
                ? "w-6 bg-logo-gold"
                : "w-2 bg-white/50 hover:bg-white"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden">
      {user && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            <p className="text-sm font-medium text-slate-700">Welcome, <span className="text-logo-blue font-semibold">{user.email}</span></p>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2 border-blue-900/30 bg-blue-900 text-white hover:bg-logo-gold"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section
        className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-cover bg-center bg-no-repeat border-b border-zinc-200 dark:border-zinc-800"
        style={{ backgroundImage: "url('https://cdn.builder.io/api/v1/image/assets%2F320d173c900a49dba2b2dcbb914e1cb7%2F6ee847de77cd46b2a722d8a732760634?format=webp&width=1920')" }}
      >
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8 sm:space-y-10">
              {/* Label */}
              <div>
                <p className="text-center sm:text-left text-sm sm:text-base lg:text-lg font-semibold text-black tracking-wide uppercase">
                  The Global AI Talent Market
                </p>
              </div>

              {/* Mobile-only Carousel Slideshow */}
              <div className="block lg:hidden !mt-3 mb-4">
                {renderSlideshow()}
              </div>

              {/* Headline */}
              <div>
                <h1 className="text-center sm:text-left text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-relaxed">
                  The world's AI talent. <span className="bg-gradient-to-r from-logo-blue to-logo-gold bg-clip-text text-transparent">Verified by how they think.</span>
                </h1>
              </div>

              {/* Subheadline */}
              <div>
                <p className="text-center sm:text-left text-xs sm:text-sm text-slate-600 leading-[2.5]">
                  Skillgo.africa is the Global AI Talent Market where AI professionals showcase what they build and prove the thinking behind it. No guesswork. No inflated CVs. Just verified talent, ready to work.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center sm:justify-start">
                <Button
                  asChild
                  size="md"
                  className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white px-6 py-3 text-sm font-bold shadow-lg"
                >
                  <Link to="/signin" className="flex items-center justify-center">
                    Join the Market
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Image at the Center (Slideshow) */}
            <div className="hidden lg:block">
              {renderSlideshow()}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section
        className="relative py-16 border-y border-white/5 bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: 'url("https://cdn.builder.io/api/v1/image/assets%2F945c9498045d46559ef5d9406b9ff3a5%2Fae2df40d89434ca2a16838355c345107?format=webp&width=1200")' }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-slate-950/60 z-0" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Statistics Heading */}
          <div className="text-center mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider">Employers, Stop losing to bad hires</h2>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-5 text-center sm:text-left transition-all duration-300 hover:bg-white/10 hover:border-white/20">
              <p className="text-xl sm:text-2xl font-bold text-logo-gold mb-1">75%</p>
              <p className="text-sm text-slate-200">Fewer bad hires with SkillGo</p>
            </div>
            <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-5 text-center sm:text-left transition-all duration-300 hover:bg-white/10 hover:border-white/20">
              <p className="text-xl sm:text-2xl font-bold text-white mb-1">5 days</p>
              <p className="text-sm text-slate-200">Time-to-hire with SkillGo</p>
            </div>
            <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-5 text-center sm:text-left transition-all duration-300 hover:bg-white/10 hover:border-white/20">
              <p className="text-xl sm:text-2xl font-bold text-logo-gold mb-1">56–61%</p>
              <p className="text-sm text-slate-200">Less bias with SkillGo</p>
            </div>
            <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-5 text-center sm:text-left transition-all duration-300 hover:bg-white/10 hover:border-white/20">
              <p className="text-xl sm:text-2xl font-bold text-white mb-1">40%</p>
              <p className="text-sm text-slate-200">Better hiring accuracy with SkillGo</p>
            </div>
            <Link
              to="/global-ai-talent-market"
              className="rounded-lg bg-gradient-to-r from-logo-blue to-logo-gold p-5 text-center flex flex-col justify-center items-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg text-white font-bold border border-white/20 col-span-1 sm:col-span-2 lg:col-span-1"
            >
              <span className="text-sm sm:text-base mb-1 flex items-center gap-2">
                Hire Verified Talent
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            {/* Who Is It For Section */}
            <div className="mb-16">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Get involved</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    id: 'job-seekers',
                    label: 'Job seekers',
                    subtitle: 'Your thinking is your most valuable asset. Now you can prove it.',
                    content: null,
                    link: '/job-seekers',
                    color: 'logo-blue'
                  },
                  {
                    id: 'employers',
                    label: 'Employers',
                    subtitle: 'Reduce hiring time and budget, reduce bad-hire risk.',
                    content: null,
                    link: '/employers',
                    color: 'logo-gold'
                  },
                  {
                    id: 'investors',
                    label: 'Investors',
                    subtitle: 'Back the market that goes deeper than the portfolio.',
                    content: null,
                    link: '/investors',
                    color: 'logo-blue'
                  },
                  {
                    id: 'recruiters-eye',
                    label: 'Recruiter\'s Eye',
                    subtitle: 'See what recruiters are looking for today',
                    content: null,
                    link: '/recruiters-eye',
                    color: 'logo-gold'
                  }
                ].map((item) => {
                  const isBlue = item.color === 'logo-blue';
                  const borderColor = isBlue ? 'border-logo-blue/30 hover:border-logo-blue/60' : 'border-logo-gold/30 hover:border-logo-gold/60';
                  const bgGradient = isBlue ? 'from-white via-logo-blue/2 to-white' : 'from-white via-logo-gold/2 to-white';
                  const iconColor = isBlue ? 'text-logo-blue' : 'text-logo-gold';
                  const textColor = isBlue ? 'text-logo-blue' : 'text-logo-gold';
                  const headingColor = (item.id === 'employers' || item.id === 'recruiters-eye') ? 'text-black' : textColor;

                  return (
                    <div key={item.id} className={`rounded-lg bg-gradient-to-br ${bgGradient} border-2 ${borderColor} transition-all hover:shadow-lg`}>
                      {item.link ? (
                        <Link
                          to={item.link}
                          className="w-full p-4 flex items-start gap-3 text-left hover:bg-logo-gold/10 transition-colors"
                        >
                          <span className={`${iconColor} font-bold text-base mt-0.5 flex-shrink-0`}>✓</span>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold ${headingColor} text-sm sm:text-base`}>{item.label}:</h3>
                            <p className="text-foreground/80 text-xs sm:text-sm leading-loose">{item.subtitle}</p>
                          </div>
                          <ArrowRight className={`h-4 w-4 ${iconColor} flex-shrink-0 mt-0.5`} />
                        </Link>
                      ) : (
                        <>
                          <button
                            onClick={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
                            className="w-full p-4 flex items-start gap-3 text-left hover:bg-logo-gold/10 transition-colors"
                          >
                            <span className={`${iconColor} font-bold text-base mt-0.5 flex-shrink-0`}>✓</span>
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-semibold ${headingColor} text-sm sm:text-base`}>{item.label}:</h3>
                              <p className="text-foreground/80 text-xs sm:text-sm leading-loose">{item.subtitle}</p>
                            </div>
                            <ArrowRight className={`h-4 w-4 ${iconColor} flex-shrink-0 mt-0.5 transition-transform duration-300`} />
                          </button>

                          {expandedCard === item.id && item.content && (
                            <div className={`px-4 pb-4 border-t border-${item.color}/20 text-foreground/80 text-xs sm:text-sm leading-relaxed`}>
                              {item.content}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>


          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
