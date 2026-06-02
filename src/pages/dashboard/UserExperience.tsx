import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { apiFetch, isAuthExpired } from "@/lib/api";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

const UserExperience = forwardRef((props, ref) => {
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  useImperativeHandle(ref, () => ({
    triggerAdd: handleAddClick
  }));

  // Fetch experiences on mount
  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/api/Users/WorkExperience/all-work-experiences");
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.data || [];
        // Use the actual ID from the API - don't generate fake ones
        const itemsWithIds = items.map((item: any) => ({
          ...item,
          // Preserve the actual ID from API (could be 'id', 'workExperienceId', etc.)
          id: item.id || item.workExperienceId || item.experienceId || item.WorkExperienceId,
          company: item.company || item.Company,
          role: item.role || item.Role,
          startDate: item.startDate || item.StartDate,
          endDate: item.endDate || item.EndDate,
          description: item.description || item.Description,
        }));
        setExperiences(itemsWithIds);
      } else if (isAuthExpired(response)) {
        console.log("User session expired (401)");
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again to continue.",
          variant: "destructive",
        });
      } else {
        console.error("Failed to fetch experiences, status:", response.status);
        toast({
          title: "Unable to load experiences",
          description: "We're having trouble loading your work experience. Please refresh the page or try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching experiences:", error);
      toast({
        title: "Unable to load experiences",
        description: "We're having trouble loading your work experience. Please refresh the page or try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setShowDialog(true);
  };

  const handleEditClick = (experience: WorkExperience) => {
    setEditingId(experience.id);
    setFormData({
      company: experience.company,
      role: experience.role,
      startDate: experience.startDate.split("T")[0],
      endDate: experience.endDate.split("T")[0],
      description: experience.description,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;

    try {
      const response = await apiFetch(
        `/api/Users/WorkExperience/${id}`,
        { method: "DELETE" }
      );

      // Check if it's a success status (2xx) or if the API returned an error message
      if (response.ok || response.status === 200 || response.status === 204) {
        setExperiences(experiences.filter((e) => e.id !== id));
        toast({
          title: "Success",
          description: "Experience deleted successfully",
        });
      } else if (isAuthExpired(response)) {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again to continue.",
          variant: "destructive",
        });
      } else {
        let errorMessage = "Failed to delete experience";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // Response is not JSON, try to get text
          try {
            const textResponse = await response.text();
            if (textResponse && textResponse !== "xhr error") {
              errorMessage = textResponse;
            }
          } catch (e) {
            // Couldn't parse response
          }
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.company ||
      !formData.role ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.description
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Send both PascalCase and camelCase to be safe
      const payload: any = {
        Company: formData.company,
        Role: formData.role,
        StartDate: new Date(formData.startDate).toISOString(),
        EndDate: new Date(formData.endDate).toISOString(),
        Description: formData.description,
      };

      if (editingId) {
        payload.WorkExperienceId = editingId;
        payload.ExperienceId = editingId;
      }

      if (editingId) {
        // Update existing
        const response = await apiFetch(
          `/api/Users/WorkExperience/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          // Try to parse response, but it may not have a body
          let updated: any = null;
          try {
            updated = await response.json();
          } catch (e) {
            // No JSON response body, use the form data instead
            updated = payload;
          }

          // Update the experience with new data, preserving the actual ID
          const itemWithId = {
            ...experiences.find((e) => e.id === editingId),
            ...updated,
            id: updated.id || updated.workExperienceId || updated.experienceId || updated.WorkExperienceId || editingId,
            company: updated.company || updated.Company || payload.Company,
            role: updated.role || updated.Role || payload.Role,
            startDate: updated.startDate || updated.StartDate || payload.StartDate,
            endDate: updated.endDate || updated.EndDate || payload.EndDate,
            description: updated.description || updated.Description || payload.Description,
          };
          setExperiences(
            experiences.map((e) => (e.id === editingId ? itemWithId : e))
          );
          toast({
            title: "Success",
            description: "Experience updated successfully",
          });
          setShowDialog(false);
        } else if (isAuthExpired(response)) {
          toast({
            title: "Session expired",
            description: "Your session has expired. Please log in again to continue.",
            variant: "destructive",
          });
        } else {
          let errorMessage = "Failed to update experience";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Response is not JSON
          }
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        // Create new
        const response = await apiFetch(
          "/api/Users/WorkExperience/add-work-experience",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          const created = await response.json();
          // Use the actual ID from API response
          const itemWithId = {
            ...created,
            id: created.id || created.workExperienceId || created.experienceId || created.WorkExperienceId,
            company: created.company || created.Company || payload.Company,
            role: created.role || created.Role || payload.Role,
            startDate: created.startDate || created.StartDate || payload.StartDate,
            endDate: created.endDate || created.EndDate || payload.EndDate,
            description: created.description || created.Description || payload.Description,
          };
          setExperiences([...experiences, itemWithId]);
          toast({
            title: "Success",
            description: "Experience added successfully",
          });
          setShowDialog(false);
        } else if (isAuthExpired(response)) {
          toast({
            title: "Session expired",
            description: "Your session has expired. Please log in again to continue.",
            variant: "destructive",
          });
        } else {
          let errorMessage = "Failed to add experience";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Response is not JSON
          }
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting experience:", error);
      toast({
        title: "Error",
        description: "Failed to submit experience",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-logo-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {experiences.length === 0 && !loading && (
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground mb-4">No experience records yet</p>
            <Button
              onClick={handleAddClick}
              variant="outline"
              className="text-logo-blue border-logo-blue hover:bg-logo-blue/10"
            >
              Add Your First Experience
            </Button>
          </CardContent>
        </Card>
      )}

      {experiences.length > 0 && (
        <div className="flex justify-end">
          <div className="flex flex-col gap-6 w-full md:w-1/2">
            {experiences.map((experience) => (
              <Card key={experience.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative group">
              <div className="absolute top-4 right-4 flex gap-1 z-10">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEditClick(experience)}
                  className="text-slate-400 hover:text-logo-blue hover:bg-logo-blue/5 rounded-full h-8 w-8 bg-white shadow-sm border border-slate-100"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(experience.id)}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8 bg-white shadow-sm border border-slate-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardHeader className="pb-3 pt-6 px-6">
                <div className="space-y-2">
                  <CardTitle className="text-base font-bold text-slate-900 leading-tight pr-16">
                    {experience.role}
                  </CardTitle>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-logo-blue">{experience.company}</span>
                    <div className="flex items-center text-xs text-slate-500 font-medium">
                      <span>{new Date(experience.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                      <span className="mx-1">—</span>
                      <span>{new Date(experience.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 flex-1">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{experience.description}</p>
              </CardContent>
            </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Update Experience" : "Add Experience"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update your work experience details"
                : "Add a new work experience entry"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="Company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="Job title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your experience"
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3 justify-end pt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="bg-logo-blue hover:bg-logo-blue/90 text-white font-bold"
              >
                {editingId ? "Update" : "Add"} Experience
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default UserExperience;
