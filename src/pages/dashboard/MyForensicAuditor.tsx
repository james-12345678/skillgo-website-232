import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, ChevronRight, Loader2, Calendar } from "lucide-react";

const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back{user?.name ? `, ${user.name}` : ''}! ✨
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed font-medium">
          Your education and experience counts. <span className="text-amber-600 font-semibold">SkillGo</span> <span className="text-slate-900">helps you prove it.</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/forensic-app/learning">
            <Button className="bg-logo-blue hover:bg-logo-blue/90 text-white px-8 py-6 text-base font-semibold">
              AI Talent Incubator
            </Button>
          </Link>
          <Link to="/forensic-app/projects">
            <Button className="bg-logo-gold hover:bg-logo-gold/90 px-8 py-6 text-base font-semibold">
              Verify your projects
            </Button>
          </Link>
          <Link to="/forensic-app/portfolio">
            <Button variant="outline" className="px-8 py-6 text-base font-semibold">
              View Portfolio
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        <Link to="/forensic-app/projects?tab=create">
          <Card className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 h-full">
            <div className="aspect-video relative overflow-hidden bg-slate-50/50 flex items-center justify-center p-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fb63104c7fb8146029e2b62e8c49f2132%2F1c005996ecd34ceba27ca74e214603d9?format=webp&width=800&height=1200"
                alt="Your degree matters. Add evidence"
                className="object-contain w-full h-full transform hover:scale-110 transition-transform duration-300"
              />
            </div>
            <CardHeader className="p-4 text-center">
              <CardTitle className="text-sm">Your degree matters. Add evidence</CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/forensic-app/portfolio?project=1&expand=true">
          <Card className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 h-full">
            <div className="aspect-video relative overflow-hidden bg-slate-50/50 flex items-center justify-center p-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fb63104c7fb8146029e2b62e8c49f2132%2F0083b08086af421a94906bb0ef488e7d?format=webp&width=800&height=1200"
                alt="Logic Integrity Audit"
                className="object-contain w-full h-full transform hover:scale-110 transition-transform duration-300"
              />
            </div>
            <CardHeader className="p-4 text-center">
              <CardTitle className="text-sm">Evidence recruiters can trust</CardTitle>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/forensic-app/portfolio?tab=share">
          <Card className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 h-full">
            <div className="aspect-video relative overflow-hidden bg-slate-50/50 flex items-center justify-center p-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fb63104c7fb8146029e2b62e8c49f2132%2F55f78b78b78a4b1d98f8ccd9918ce922?format=webp&width=800&height=1200"
                alt="Portfolio Dashboard"
                className="object-contain w-full h-full transform hover:scale-110 transition-transform duration-300"
              />
            </div>
            <CardHeader className="p-4 text-center">
              <CardTitle className="text-sm">Verified links, ready for your CV.</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>
        </div>
    </div>
  );
};

export default DashboardHome;
