import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { apiFetch, isAuthExpired } from "@/lib/api";
import { UserCircle, FolderKanban, Menu, X, Eye, Sparkles, Target, TrendingUp, ChevronLeft, ChevronRight, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface OverviewSection {
  title: string;
  points: string[];
}

interface SectionTone {
  cardClass: string;
  titleClass: string;
  bulletClass: string;
}

const sectionTones: Record<string, SectionTone> = {
  "Skills Employers Want": {
    cardClass: "border-logo-blue/20 bg-gradient-to-br from-logo-blue/5 to-white",
    titleClass: "text-logo-blue",
    bulletClass: "bg-logo-blue",
  },
  Tools: {
    cardClass: "border-logo-gold/20 bg-gradient-to-br from-logo-gold/10 to-white",
    titleClass: "text-logo-gold",
    bulletClass: "bg-logo-gold",
  },
  "Possible Projects": {
    cardClass: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
    titleClass: "text-emerald-600",
    bulletClass: "bg-emerald-500",
  },
};

const splitSectionContent = (content: string): string[] => {
  const normalized = content.replace(/\r/g, " ").trim();
  if (!normalized) return [];

  return normalized
    .split(/(?:\n+|\s{2,}|\s*[•·▪]\s*)/g)
    .map((item) => item.replace(/\s+([,.)\]])/g, "$1").trim())
    .filter(Boolean);
};

const overviewSectionOrder = ["Skills Employers Want", "Tools", "Possible Projects"] as const;

type OverviewSectionTitle = (typeof overviewSectionOrder)[number];

const overviewSectionMatchers: Array<{ title: OverviewSectionTitle; regex: RegExp }> = [
  {
    title: "Possible Projects",
    regex: /(?:Possible Projects(?:\s*\([^)]*\))?|Uploadable Projects)(?:\s*:?)/i,
  },
  {
    title: "Skills Employers Want",
    regex: /Skills Employers Want(?:\s*\([^)]*\))?(?:\s*:?)/i,
  },
  {
    title: "Tools",
    regex: /Tools(?: to use)?(?:\s*\([^)]*\))?(?:\s*:?)/i,
  },
];

const parseOverviewSections = (overview: string): OverviewSection[] => {
  const rawOverview = overview.replace(/\r/g, "").trim();
  if (!rawOverview) {
    return overviewSectionOrder.map((title) => ({ title, points: [] }));
  }

  const matches = overviewSectionMatchers
    .map(({ title, regex }) => {
      const match = regex.exec(rawOverview);
      if (!match || match.index === undefined) return null;

      return {
        title,
        start: match.index,
        end: match.index + match[0].length,
      };
    })
    .filter((match): match is { title: OverviewSectionTitle; start: number; end: number } => Boolean(match))
    .sort((a, b) => a.start - b.start);

  const getSectionContent = (title: OverviewSectionTitle) => {
    const match = matches.find((item) => item.title === title);

    if (title === "Possible Projects" && !match) {
      const nextMatch = matches[0];
      return rawOverview.slice(0, nextMatch?.start ?? rawOverview.length).trim();
    }

    if (!match) return "";

    const nextMatch = matches.find((item) => item.start > match.start);
    return rawOverview.slice(match.end, nextMatch?.start ?? rawOverview.length).trim();
  };

  return overviewSectionOrder.map((title) => ({
    title,
    points: splitSectionContent(getSectionContent(title)),
  }));
};

const RecruiterOverviewContent = ({ overview }: { overview: string }) => {
  const sections = parseOverviewSections(overview);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {sections.map((section) => {
        const tone = sectionTones[section.title] ?? {
          cardClass: "border-slate-200 bg-gradient-to-br from-slate-50 to-white",
          titleClass: "text-slate-700",
          bulletClass: "bg-slate-500",
        };

        return (
          <div key={section.title} className={`rounded-2xl border p-4 shadow-sm text-center sm:text-left ${tone.cardClass}`}>
            <p className={`text-[11px] font-bold uppercase tracking-[0.18em] font-poppins ${tone.titleClass}`}>
              {section.title}
            </p>
            <ul className="mt-3 space-y-2">
              {section.points.length > 0 ? (
                section.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm leading-6 text-slate-700 justify-center sm:justify-start">
                    <span className={`mt-2 h-2 w-2 rounded-full ${tone.bulletClass} flex-shrink-0`} />
                    <span className="whitespace-pre-wrap">{point}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm leading-6 text-slate-500 whitespace-pre-wrap">No details available.</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRecruiterEye, setShowRecruiterEye] = useState(false);
  const [recruiterEyes, setRecruiterEyes] = useState<any[]>([]);
  const [loadingRecruiterEyes, setLoadingRecruiterEyes] = useState(false);
  const [selectedRecruiterEye, setSelectedRecruiterEye] = useState<any>(null);
  const [recruiterEyesPage, setRecruiterEyesPage] = useState(1);
  const [hasMoreRecruiterEyes, setHasMoreRecruiterEyes] = useState(false);
  const { toast } = useToast();
  const selectedRecruiterEyeIndex = selectedRecruiterEye
    ? recruiterEyes.findIndex((eye) => (eye.recruiterEyeId || eye.id) === (selectedRecruiterEye.recruiterEyeId || selectedRecruiterEye.id))
    : -1;
  const selectedRecruiterEyeName = selectedRecruiterEye?.name || selectedRecruiterEye?.Name || "Untitled Insight";

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out successfully" });
    navigate("/signin", { replace: true });
  };

  const navigateRecruiterEye = (direction: "previous" | "next") => {
    if (selectedRecruiterEyeIndex < 0) return;

    const nextIndex = direction === "previous"
      ? selectedRecruiterEyeIndex - 1
      : selectedRecruiterEyeIndex + 1;

    const nextEye = recruiterEyes[nextIndex];
    if (!nextEye) return;

    setSelectedRecruiterEye(nextEye);
  };

  const navLinks = [
    { name: "Home", path: "/forensic-app" },
    { name: "Education+Experience/Certifications", path: "/forensic-app/resume" },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("recruiterEye") === "true") {
      setShowRecruiterEye(true);
      setSelectedRecruiterEye(null);
      void loadRecruiterEyes(recruiterEyesPage);
    }
  }, [location.search, recruiterEyesPage]);


  const loadRecruiterEyes = async (pageNumber: number = 1) => {
    setLoadingRecruiterEyes(true);
    try {
      const res = await apiFetch(`/api/recruiter-eye?pageNumber=${pageNumber}&pageSize=10`, {
        headers: { "Accept": "*/*" }
      });
      if (res.ok) {
        const data = await res.json();
        let recruiterEyesList: any[] = [];

        // Handle different response formats
        if (Array.isArray(data)) {
          recruiterEyesList = data;
        } else if (data?.items && Array.isArray(data.items)) {
          recruiterEyesList = data.items;
        } else if (data?.data && Array.isArray(data.data)) {
          recruiterEyesList = data.data;
        } else if (data?.recruiterEyes && Array.isArray(data.recruiterEyes)) {
          recruiterEyesList = data.recruiterEyes;
        } else if (data?.RecruiterEyes && Array.isArray(data.RecruiterEyes)) {
          recruiterEyesList = data.RecruiterEyes;
        } else {
          // Try to extract as object keys
          const values = Object.values(data);
          if (values.length > 0 && Array.isArray(values[0])) {
            recruiterEyesList = values[0];
          }
        }

        setRecruiterEyes(recruiterEyesList || []);
        setRecruiterEyesPage(pageNumber);
        // If we got fewer than 10 records, there are no more pages
        setHasMoreRecruiterEyes((recruiterEyesList || []).length === 10);
      } else if (isAuthExpired(res)) {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error loading Recruiter Eyes",
          description: "Could not fetch Recruiter Eyes from the server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching Recruiter Eyes:", error);
      toast({
        title: "Error loading Recruiter Eyes",
        description: "We're having trouble loading Recruiter Eyes right now.",
        variant: "destructive",
      });
    } finally {
      setLoadingRecruiterEyes(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-poppins text-slate-900 overflow-x-hidden">
      {/* Minimal Header */}
      <header className="border-b-2 border-slate-100 sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-logo-gold/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-2 sm:px-4 h-16 sm:h-24 flex items-center justify-between relative">
          <Link to="/marketing" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img
              src="/skillgo-logo.svg"
              alt="SkillGo"
              className="h-20 sm:h-28 object-contain"
            />
          </Link>

          <nav className="hidden sm:flex items-center gap-4 md:gap-12 lg:gap-20">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs sm:text-sm md:text-base font-semibold transition-colors whitespace-nowrap ${
                  location.pathname === link.path
                    ? "text-logo-gold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="hidden sm:inline">{link.name}</span>
                <span className="sm:hidden">{link.name.split('/')[0]}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-12">
            <button
              onClick={() => {
                setShowRecruiterEye(true);
                setSelectedRecruiterEye(null);
                setRecruiterEyesPage(1);
                void loadRecruiterEyes(1);
              }}
              className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-base font-semibold transition-colors text-slate-600 hover:text-logo-gold group whitespace-nowrap"
              title="The Recruiter's Eye 2026"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 group-hover:text-logo-gold transition-colors flex-shrink-0" />
              <span className="hidden md:inline">The Recruiter's Eye 2026</span>
              <span className="sm:hidden">Eye</span>
            </button>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm text-slate-600 truncate max-w-xs">{user?.email || ""}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-8 rounded-full border-logo-gold/30 px-3 sm:px-4 text-xs font-semibold !bg-logo-gold !text-white shadow-md hover:!bg-logo-blue hover:shadow-logo-gold/20 whitespace-nowrap"
              >
                Logout
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-b-2 border-slate-100 animate-in slide-in-from-top duration-200">
            <nav className="max-w-6xl mx-auto flex flex-col p-3 space-y-2 px-2">
              {/* Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block text-xs sm:text-sm font-semibold transition-colors py-2.5 px-3 rounded-lg ${
                    location.pathname === link.path
                      ? "text-logo-gold bg-logo-gold/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Recruiter's Eye Button */}
              <button
                onClick={() => {
                  setShowRecruiterEye(true);
                  setSelectedRecruiterEye(null);
                  setRecruiterEyesPage(1);
                  void loadRecruiterEyes(1);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-xs sm:text-sm font-semibold transition-colors text-slate-600 hover:text-logo-gold text-left flex items-center gap-2 py-2.5 px-3 rounded-lg hover:bg-slate-50"
              >
                <Eye className="w-4 h-4 flex-shrink-0" />
                The Recruiter's Eye 2026
              </button>

              {/* Divider */}
              <div className="h-px bg-slate-100 my-2"></div>

              {/* User Profile Section */}
              <div className="flex items-center px-3 py-2 bg-slate-50 rounded-lg w-full">
                <div className="w-8 h-8 rounded-full bg-logo-gold flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="text-xs font-semibold text-slate-900 ml-2 flex-1 truncate">{user?.name || "User"}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full rounded-lg border-logo-gold/30 !bg-logo-gold !text-white hover:!bg-logo-blue hover:shadow-logo-gold/20 text-xs sm:text-sm font-semibold"
              >
                Logout
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-2 sm:px-4 py-6 sm:py-8 md:py-12">
        {children}
      </main>

      {/* Recruiter's Eye 2026 Modal */}
      <Dialog open={showRecruiterEye} onOpenChange={(open) => {
        if (!open) {
          setShowRecruiterEye(false);
        }
      }}>
        <DialogContent className="border-0 shadow-2xl rounded-lg bg-white overflow-hidden max-w-4xl">
          <DialogClose className="absolute right-4 top-4" />

          <DialogHeader className="relative pt-4 pb-3 px-6 text-center bg-gradient-to-r from-logo-blue/5 to-logo-gold/5 rounded-b-2xl">
            <div className="flex items-baseline justify-center gap-2">
              <DialogTitle className="text-lg sm:text-xl font-black text-logo-blue">
                The Recruiter's Eye
              </DialogTitle>
              <p className="text-lg sm:text-xl font-black text-logo-gold">2026</p>
            </div>
          </DialogHeader>

          <div className="px-6 py-4 space-y-3 max-h-[80vh] overflow-y-auto pr-2">
            {/* Main Description */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium m-0">
              Discover the skills, tools, and demand trends shaping your field — then design a project that proves your capability.
            </p>

            {/* CTA Section */}
            <div className="p-4 bg-gradient-to-r from-logo-blue/5 to-logo-gold/5 border-l-4 border-logo-gold rounded-lg">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                <span className="text-logo-blue font-black">Ready to stand out?</span> Use these insights to design a project that demonstrates your expertise and aligns with what the market demands.
              </p>
            </div>

            {/* Recruiter Eyes Section */}
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-3 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-logo-gold" />
                {selectedRecruiterEye ? "Overview" : "Insights"}
              </h3>

              {loadingRecruiterEyes ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-3 border-logo-gold border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : selectedRecruiterEye ? (
                // Show overview when a recruiter eye is selected
                <div className="space-y-4">
                  <div className="rounded-2xl border border-logo-gold/20 bg-gradient-to-br from-white to-logo-gold/5 p-4 shadow-sm text-center sm:text-left">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Course</p>
                    <div className="mt-1 flex flex-col gap-3 items-center sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="text-lg font-black text-slate-900">{selectedRecruiterEyeName}</h4>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 border-0 bg-gradient-to-r from-logo-blue via-logo-gold to-orange-500 text-white font-semibold whitespace-nowrap shadow-lg shadow-logo-gold/20 hover:shadow-xl hover:shadow-logo-gold/30 hover:brightness-105"
                        onClick={() => setShowRecruiterEye(false)}
                      >
                        <Link to={`/forensic-app/tools?course=${encodeURIComponent(selectedRecruiterEyeName)}`}>
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                            <Wrench className="h-3.5 w-3.5" />
                          </span>
                          Tools
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 items-center sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={() => setSelectedRecruiterEye(null)}
                      className="text-sm font-semibold text-logo-blue hover:text-logo-gold transition-colors"
                    >
                      ← Back to Insights
                    </button>
                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateRecruiterEye("previous")}
                        disabled={selectedRecruiterEyeIndex <= 0}
                        className="font-semibold"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-xs font-semibold text-slate-500 px-2">
                        {selectedRecruiterEyeIndex + 1} of {recruiterEyes.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateRecruiterEye("next")}
                        disabled={selectedRecruiterEyeIndex < 0 || selectedRecruiterEyeIndex >= recruiterEyes.length - 1}
                        className="font-semibold"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-logo-blue/5 to-logo-gold/5 border-2 border-logo-gold/20 rounded-lg">
                    <RecruiterOverviewContent overview={selectedRecruiterEye.overview || "No overview available."} />
                  </div>
                </div>
              ) : recruiterEyes.length > 0 ? (
                // Show list of recruiter eye names
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recruiterEyes.map((eye, index) => {
                      const eyeName = eye.name || eye.Name || "Untitled Insight";
                      const eyeId = eye.recruiterEyeId || eye.id || index;
                      return (
                        <div
                          key={eyeId}
                          className="group p-4 bg-white border-2 border-slate-100 rounded-lg hover:border-logo-gold/60 hover:shadow-md hover:bg-gradient-to-br hover:from-white hover:to-logo-gold/5 transition-all duration-300 cursor-pointer"
                          onClick={() => {
                            setSelectedRecruiterEye(eye);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-logo-blue/10 to-logo-gold/10 rounded group-hover:from-logo-blue/20 group-hover:to-logo-gold/20 transition-all flex-shrink-0">
                              <Target className="w-4 h-4 text-logo-gold" />
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-logo-blue transition-colors">
                              {eyeName}
                            </h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadRecruiterEyes(recruiterEyesPage - 1)}
                      disabled={recruiterEyesPage <= 1}
                      className="font-semibold"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-xs font-semibold text-slate-500 px-2">
                      Page {recruiterEyesPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadRecruiterEyes(recruiterEyesPage + 1)}
                      disabled={!hasMoreRecruiterEyes}
                      className="font-semibold"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 font-semibold">No insights available at this time.</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
};

export default DashboardLayout;
