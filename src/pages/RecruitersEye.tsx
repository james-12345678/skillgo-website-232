import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';

export default function RecruitersEye() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/forensic-app/?recruiterEye=true');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="absolute top-20 left-4 text-logo-blue hover:text-logo-gold"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-logo-blue via-logo-blue to-logo-gold bg-clip-text text-transparent">Recruiter's Eye</h1>
          <p className="text-foreground/80 mb-8 leading-relaxed">
            Sign in to access the <span className="bg-gradient-to-r from-logo-blue to-logo-gold bg-clip-text text-transparent font-semibold">Recruiter's Eye</span> and see what recruiters are looking for today.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/signin')}
              className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white font-semibold"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              variant="outline"
              className="border-2 border-gradient-to-r from-logo-blue to-logo-gold bg-gradient-to-r from-logo-blue/5 to-logo-gold/5 text-logo-blue hover:from-logo-blue/15 hover:to-logo-gold/15 font-semibold"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
