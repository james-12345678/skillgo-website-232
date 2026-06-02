import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  label?: string;
}

const BackButton = ({
  fallbackPath = "/",
  className = "",
  label = "Back",
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Use React Router's navigate(-1) for proper routing
    navigate(-1);
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={`group flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
};

export default BackButton;
