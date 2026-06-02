import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  showBackButton?: boolean;
  backPath?: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  showBackButton = true, 
  backPath,
  className = "" 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <div className={`w-full flex justify-between items-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm border-b border-border/50 ${className}`}>
      {/* Back Button */}
      {showBackButton ? (
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
      ) : (
        <div className="w-10 sm:w-[80px]" />
      )}

      {/* SkillGo Logo */}
      <div
        onClick={handleLogoClick}
        className="cursor-pointer hover:opacity-80 transition-opacity px-1"
      >
        <img
          src="/skillgo-logo.svg"
          alt="SkillGo"
          className="h-10 sm:h-14 object-contain"
        />
      </div>

      {/* Empty space for balance */}
      <div className="w-10 sm:w-[80px]" />
    </div>
  );
};

export default PageHeader;
