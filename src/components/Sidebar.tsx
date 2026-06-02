import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  BookOpen,
  Briefcase,
  Building2,
  LogIn,
  Menu,
  X,
  Award,
  FolderKanban,
  UserCircle,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const mainNavItems = [
    { name: "Home", href: "/forensic-app", icon: Home },
  ];

  const productLinks = [];

  const educationLinks = [
    { name: "Overview", href: "/education" },
    { name: "Student Program", href: "/education/student-program" },
    { name: "Adult Fast-Track", href: "/education/adult-program" },
  ];

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Vision & Mission", href: "/company/vision" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-logo-blue text-white shadow-md hover:bg-logo-blue/90"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-background border-r border-border transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } flex flex-col overflow-y-auto`}
      >
        {/* Logo Section in Sidebar (Mobile Only) */}
        <div className="p-6 md:hidden">
           <img
            src="/skillgo-logo.svg"
            alt="SkillGo"
            className="h-8 object-contain"
          />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-logo-blue/10 text-logo-blue border-l-4 border-logo-blue"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}

          {/* Mobile-only additional sections */}
          <div className="md:hidden pt-4 space-y-4">
            {/* Products Section */}
            <div>
              <button
                onClick={() => toggleSection('products')}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Products
                <ChevronDown className={`h-3 w-3 transition-transform ${expandedSection === 'products' ? 'rotate-180' : ''}`} />
              </button>
              {expandedSection === 'products' && (
                <div className="mt-1 space-y-1 ml-4">
                  {productLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={handleNavClick}
                      className="block px-4 py-2 text-sm text-foreground/70 hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Education Section */}
            <div>
              <button
                onClick={() => toggleSection('education')}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Education
                <ChevronDown className={`h-3 w-3 transition-transform ${expandedSection === 'education' ? 'rotate-180' : ''}`} />
              </button>
              {expandedSection === 'education' && (
                <div className="mt-1 space-y-1 ml-4">
                  {educationLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={handleNavClick}
                      className="block px-4 py-2 text-sm text-foreground/70 hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Company Section */}
            <div>
              <button
                onClick={() => toggleSection('company')}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Company
                <ChevronDown className={`h-3 w-3 transition-transform ${expandedSection === 'company' ? 'rotate-180' : ''}`} />
              </button>
              {expandedSection === 'company' && (
                <div className="mt-1 space-y-1 ml-4">
                  {companyLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={handleNavClick}
                      className="block px-4 py-2 text-sm text-foreground/70 hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Bottom Section - User or Auth Buttons */}
        <div className="border-t border-border p-4 space-y-2">
          {user ? (
            <div className="px-4 py-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-foreground/60 truncate">
                {user.email}
              </p>
            </div>
          ) : (
            <Link
              to="/signin"
              onClick={handleNavClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-logo-blue text-white hover:bg-logo-blue/90 transition-all duration-200 text-sm font-medium"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Spacer on Desktop */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  );
};

export default Sidebar;
