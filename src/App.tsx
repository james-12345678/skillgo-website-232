import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, type ComponentType, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import PublicLayout from "@/components/PublicLayout";
import ReactGA from 'react-ga4';

// Lazy load dashboard components for faster initial load
const MyForensicAuditor = lazy(() => import("./pages/dashboard/MyForensicAuditor"));
const Projects = lazy(() => import("./pages/dashboard/Projects"));
const Portfolio = lazy(() => import("./pages/dashboard/Portfolio"));
const SharedPortfolioPdf = lazy(() => import("./pages/SharedPortfolioPdf"));
const CompletedTasks = lazy(() => import("./pages/dashboard/CompletedTasks"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const EducationExperience = lazy(() => import("./pages/dashboard/EducationExperience"));
const Tools = lazy(() => import("./pages/dashboard/Tools"));
const Learning = lazy(() => import("./pages/dashboard/Learning"));

import Index from "./pages/Index";
import AboutUs from "./pages/AboutUs";
import HowItWorks from "./pages/HowItWorks";
import NonCoders from "./pages/NonCoders";
import Payment from "./pages/Payment";
import PaymentResponse from "./pages/PaymentResponse";
import Payments from "./pages/Payments";
import Employers from "./pages/Employers";
import JobSeekers from "./pages/JobSeekers";
import Investors from "./pages/Investors";
import VisionMission from "./pages/VisionMission";
import ContactUs from "./pages/ContactUs";
import FAQs from "./pages/FAQs";
import OurPrograms from "./pages/OurPrograms";
import ForEmployers from "./pages/ForEmployers";
import RegisterWaitingList from "./pages/RegisterWaitingList";
import UpcomingEvents from "./pages/UpcomingEvents";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import Verification from "./pages/Verification";
import PlaceholderPage from "./pages/PlaceholderPage";
import BecomeMentor from "./pages/BecomeMentor";
import VerifiedMentors from "./pages/VerifiedMentors";
import AIIncubator from "./pages/AIIncubator";
import GlobalAITalentMarket from "./pages/GlobalAITalentMarket";
import RecruitersEye from "./pages/RecruitersEye";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import SignUpSuccess from "./pages/SignUpSuccess";
import ConfirmEmail from "./pages/ConfirmEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import { Toaster as UIToaster } from "@/components/ui/toaster";

// Initialize Google Analytics
const googleAnalyticsId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
if (googleAnalyticsId) {
  ReactGA.initialize(googleAnalyticsId);
}

const queryClient = new QueryClient();

// Helper to wrap pages with PublicLayout for marketing routes
const withPublicLayout = (Component: ComponentType<any>) => (
  <PublicLayout>
    <Component />
  </PublicLayout>
);

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full animate-spin bg-gradient-to-r from-logo-blue to-logo-gold p-0.5">
          <div className="w-full h-full bg-background rounded-full"></div>
        </div>
      </div>
    );
  }

  // Consolidated routes for both authenticated and non-authenticated users
  return (
    <Routes>
      {/* Marketing routes wrapped with PublicLayout - redirect to dashboard if logged in */}
      <Route path="/" element={
        user ? (
          <Navigate to={String(user.role).toLowerCase() === 'admin' ? "/admin/dashboard" : "/forensic-app"} replace />
        ) : (
          <Navigate to="/home" replace />
        )
      } />

      <Route path="/home" element={withPublicLayout(Index)} />
      <Route path="/how-it-works" element={withPublicLayout(HowItWorks)} />
      <Route path="/non-coders" element={withPublicLayout(NonCoders)} />
      <Route path="/employers" element={withPublicLayout(Employers)} />
      <Route path="/job-seekers" element={withPublicLayout(JobSeekers)} />
      <Route path="/investors" element={withPublicLayout(Investors)} />
      <Route
        path="/portfolio/shared/:token"
        element={
          <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="w-8 h-8 rounded-full animate-spin bg-gradient-to-r from-logo-blue to-logo-gold p-0.5">
                <div className="w-full h-full bg-background rounded-full"></div>
              </div>
            </div>
          }>
            <SharedPortfolioPdf />
          </Suspense>
        }
      />
      <Route
        path="/forensic-app/portfolio/shared/:token"
        element={
          <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="w-8 h-8 rounded-full animate-spin bg-gradient-to-r from-logo-blue to-logo-gold p-0.5">
                <div className="w-full h-full bg-background rounded-full"></div>
              </div>
            </div>
          }>
            <SharedPortfolioPdf />
          </Suspense>
        }
      />
      <Route
        path="/users/portfolio/:token"
        element={
          <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="w-8 h-8 rounded-full animate-spin bg-gradient-to-r from-logo-blue to-logo-gold p-0.5">
                <div className="w-full h-full bg-background rounded-full"></div>
              </div>
            </div>
          }>
            <SharedPortfolioPdf />
          </Suspense>
        }
      />

      {/* Authentication pages */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signup-success" element={<SignUpSuccess />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Payment pages */}
      <Route path="/payment" element={withPublicLayout(Payment)} />
      <Route path="/payments" element={withPublicLayout(Payments)} />
      <Route path="/payment/response" element={withPublicLayout(PaymentResponse)} />

      {/* Legacy login route redirects to signin for backward compatibility */}
      <Route path="/login" element={<Navigate to="/signin" replace />} />

      {/* Dashboard redirect for compatibility */}
      <Route path="/dashboard" element={
        String(user?.role).toLowerCase() === 'admin'
          ? <Navigate to="/admin/dashboard" replace />
          : <Navigate to="/forensic-app" replace />
      } />
      <Route path="/dashboard/*" element={
        String(user?.role).toLowerCase() === 'admin'
          ? <Navigate to="/admin/dashboard" replace />
          : <Navigate to="/forensic-app" replace />
      } />

      {/* Train Your Forensic Auditor app - conditional access based on authentication */}
      {user && String(user.role).toLowerCase() !== 'admin' ? (
        <Route
          path="/forensic-app/*"
          element={
            <DashboardLayout>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="w-8 h-8 rounded-full animate-spin bg-gradient-to-r from-logo-blue to-logo-gold p-0.5">
                    <div className="w-full h-full bg-background rounded-full"></div>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<MyForensicAuditor />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="portfolio" element={<Portfolio />} />
                  <Route path="learning" element={<Learning />} />
                  <Route path="education" element={<Navigate to="/forensic-app/resume" replace />} />
                  <Route path="experience" element={<Navigate to="/forensic-app/resume" replace />} />
                  <Route path="resume" element={<EducationExperience />} />
                  <Route path="tools" element={<Tools />} />
                  <Route path="completed-tasks" element={<CompletedTasks />} />
                  <Route path="settings" element={<Settings />} />
                </Routes>
              </Suspense>
            </DashboardLayout>
          }
        />
      ) : null}

      {/* Redirect unauthenticated users accessing any /forensic-app/* route to signin */}
      {!user && <Route path="/forensic-app/*" element={<Navigate to="/signin" replace />} />}

      {/* Redirect admin users accessing /forensic-app/* to admin dashboard */}
      {String(user?.role).toLowerCase() === 'admin' && <Route path="/forensic-app/*" element={<Navigate to="/admin/dashboard" replace />} />}

      {/* Marketing routes - accessible to all users */}
      <Route path="/marketing" element={<Navigate to="/home" replace />} />
      <Route path="/about" element={withPublicLayout(AboutUs)} />
      <Route path="/short-courses" element={withPublicLayout(OurPrograms)} />
      <Route path="/register-cohort" element={withPublicLayout(RegisterWaitingList)} />
      <Route path="/our-programs" element={<Navigate to="/short-courses" replace />} />
      <Route path="/upcoming-events" element={withPublicLayout(UpcomingEvents)} />
      <Route path="/blog" element={withPublicLayout(Blog)} />
      <Route path="/company/vision" element={withPublicLayout(VisionMission)} />
      <Route path="/mission" element={withPublicLayout(VisionMission)} />
      <Route path="/vision" element={withPublicLayout(VisionMission)} />
      <Route path="/contact" element={withPublicLayout(ContactUs)} />
      <Route path="/faqs" element={withPublicLayout(FAQs)} />
      <Route path="/verification" element={withPublicLayout(Verification)} />
      <Route path="/become-a-mentor" element={withPublicLayout(BecomeMentor)} />
      <Route path="/verified-mentors" element={withPublicLayout(VerifiedMentors)} />
      <Route path="/ai-incubator" element={<AIIncubator />} />
      <Route path="/global-ai-talent-market" element={withPublicLayout(GlobalAITalentMarket)} />
      <Route path="/recruiters-eye" element={<RecruitersEye />} />

      {/* Blog Pages */}
      <Route
        path="/blog/:slug"
        element={
          <PublicLayout>
            <BlogArticle />
          </PublicLayout>
        }
      />

      {/* Legal Pages */}
      <Route
        path="/terms"
        element={
          <PublicLayout>
            <PlaceholderPage
              title="Terms of Service"
              description="Legal terms for using SkillGo services."
            />
          </PublicLayout>
        }
      />
      <Route
        path="/privacy"
        element={
          <PublicLayout>
            <PlaceholderPage
              title="Privacy Policy"
              description="How we protect and handle your personal and skill data."
            />
          </PublicLayout>
        }
      />

      {/* Admin Pages */}
      <Route path="/admin/login" element={<Navigate to="/signin" replace />} />
      <Route
        path="/admin/dashboard"
        element={
          String(user?.role).toLowerCase() === 'admin' ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

      {/* Catch-all */}
      <Route path="*" element={withPublicLayout(NotFound)} />
    </Routes>
  );
};

// Component to track page views on route changes
const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (googleAnalyticsId) {
      ReactGA.send({ hitType: "pageview", page: location.pathname });
    }
  }, [location.pathname]);

  return null;
};

const AppWithTracking = () => (
  <AuthProvider>
    <PageTracker />
    <AppRoutes />
    <UIToaster />
  </AuthProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppWithTracking />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
