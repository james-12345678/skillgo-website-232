import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TransparentLogo } from "@/components/TransparentLogo";
import {
  Building2,
  HelpCircle,
  Mail,
  Menu,
  LogIn,
  Newspaper,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PublicNavigationProps {
  onToggleSidebar?: () => void;
}

const PublicNavigation = ({ onToggleSidebar }: PublicNavigationProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (href: string) => location.pathname === href;

  const publicNavItems = [
    { name: "About", href: "/about", icon: Building2 },
    { name: "How it Works", href: "/how-it-works", icon: Building2 },
    { name: "Non Coders", href: "/non-coders", icon: Building2 },
    { name: "FAQs", href: "/faqs", icon: HelpCircle },
    { name: "Blog", href: "/blog", icon: Newspaper },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  return (
    <nav
      className="sticky top-0 z-30 w-full border-b border-blue-800 bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: 'url("https://cdn.builder.io/api/v1/image/assets%2F945c9498045d46559ef5d9406b9ff3a5%2Fae2df40d89434ca2a16838355c345107?format=webp&width=1920")' }}
    >
      {/* Semi-transparent overlay to ensure navigation item readability */}
      <div className="absolute inset-0 bg-blue-950/85 backdrop-blur-xs z-0" />

      <div className="w-full px-4 sm:px-6 relative z-10">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Mobile Sidebar Toggle - Integrated into Nav */}
          <div className="md:hidden flex items-center pr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Logo Section */}
          <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <TransparentLogo
              src="https://cdn.builder.io/api/v1/image/assets%2Fb8bd62da419a47c1942694e9630577fb%2Fab3ab36c46524b73a0baf2b93506c231?format=webp&width=800&height=1200"
              alt="SkillGo"
              className="h-6 sm:h-8 md:h-10 object-contain"
            />
          </Link>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center gap-1 lg:gap-4 mx-4">
            {publicNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);


              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-white/20 text-white font-bold"
                      : "text-white bg-blue-900/50 hover:bg-logo-gold hover:text-black"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-1.5 sm:gap-3">
            {user ? (
              <div className="px-3 sm:px-4 py-2 text-[12px] sm:text-sm font-bold text-white">
                {user.email}
              </div>
            ) : (
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="text-[12px] sm:text-sm px-3 sm:px-4 font-bold h-9 sm:h-10 text-white bg-white/10 hover:bg-white/20 hover:text-white"
              >
                <Link to="/signin">
                  <LogIn className="h-4 w-4" />
                  <span>Sign in</span>
                </Link>
              </Button>
            )}


          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavigation;
