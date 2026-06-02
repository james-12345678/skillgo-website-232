import { Link, useLocation } from "react-router-dom";
import {
  Building2,
  HelpCircle,
  Mail,
  Newspaper,
} from "lucide-react";
import { useState } from "react";

interface PublicSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const PublicSidebar = ({ isOpen: controlledIsOpen, setIsOpen: controlledSetIsOpen }: PublicSidebarProps) => {
  const location = useLocation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = controlledSetIsOpen ?? setInternalIsOpen;

  const isActive = (href: string) => location.pathname === href;

  const handleNavClick = (scrollToTop = true) => {
    setIsOpen(false);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const publicNavItems = [
    { name: "About", href: "/about", icon: Building2 },
    { name: "How it Works", href: "/how-it-works", icon: Building2 },
    { name: "Non Coders", href: "/non-coders", icon: Building2 },
    { name: "FAQs", href: "/faqs", icon: HelpCircle },
    { name: "Blog", href: "/blog", icon: Newspaper },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-background border-r border-border transition-transform duration-300 z-40 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col overflow-y-auto`}
      >
        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {publicNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);


            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => handleNavClick()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-blue-900 text-white border-l-4 border-blue-900"
                    : "text-white bg-blue-900 hover:bg-logo-gold hover:text-black"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom spacer - no auth elements for public pages */}
        <div className="border-t border-border p-4" />
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default PublicSidebar;
