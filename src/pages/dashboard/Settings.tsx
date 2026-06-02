import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { User, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsProfileSaving(true);
    try {
      updateUser(profileData);
      alert("Profile saved successfully!");
    } catch (error) {
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/signin", { replace: true });
  };

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto mobile-scroll-safe">
      <div className="mb-3 sm:mb-4">
        <h1 className="text-sm sm:text-base font-bold mb-2 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-xs text-foreground font-medium">
          Manage your profile information
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card className="border-slate-100 shadow-lg">
          <CardHeader className="p-6">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <User className="h-5 w-5 text-logo-blue" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Your email address"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-4">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-bold px-8 border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={handleLogout}
              >
                Logout
              </Button>
              <Button
                size="lg"
                className="w-full sm:w-auto font-bold px-8"
                onClick={handleSaveProfile}
                disabled={isProfileSaving}
              >
                {isProfileSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
