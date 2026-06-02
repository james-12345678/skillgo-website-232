import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, isAuthExpired } from "@/lib/api";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface Education {
  id: string;
  educationLevel: string;
  startDate: string;
  endDate: string;
  school: string;
  fieldOfStudy: string;
}

interface EducationLevel {
  label: string;
  value: string;
}

const educationLevelMap: Record<string, number> = {
  certificate: 0,
  diploma: 1,
  degree: 2,
  masters: 3,
  phd: 4,
};

const reverseEducationLevelMap: Record<number, string> = {
  0: "certificate",
  1: "diploma",
  2: "degree",
  3: "masters",
  4: "phd",
};

const UserEducation = forwardRef((props, ref) => {
  const [educations, setEducations] = useState<Education[]>([]);
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    educationLevel: "",
    startDate: "",
    endDate: "",
    school: "",
    fieldOfStudy: "",
  });
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    triggerAdd: handleAddClick
  }));

  useEffect(() => {
    setEducationLevels([
      { label: "Certificate", value: "certificate" },
      { label: "Diploma", value: "diploma" },
      { label: "Degree", value: "degree" },
      { label: "Masters", value: "masters" },
      { label: "PhD", value: "phd" },
    ]);
    setLoadingLevels(false);
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/api/users/education/all-education");
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.data || [];
        const itemsWithIds = items.map((item: any) => {
          const level = item.educationLevel || item.EducationLevel;
          return {
            ...item,
            id: item.id || item.educationId || item.EducationId,
            educationLevel: typeof level === 'number' ? (reverseEducationLevelMap[level] || level) : level,
            school: item.school || item.School,
            startDate: item.startDate || item.StartDate,
            endDate: item.endDate || item.EndDate,
            fieldOfStudy: item.fieldOfStudy || item.FieldOfStudy,
          };
        });
        setEducations(itemsWithIds);
      } else if (isAuthExpired(response)) {
        console.log("User session expired (401)");
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again to continue.",
          variant: "destructive",
        });
      } else {
        console.error("Failed to fetch educations, status:", response.status);
        toast({
          title: "Unable to load education",
          description: "We're having trouble loading your education. Please refresh the page or try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching educations:", error);
      toast({
        title: "Unable to load education",
        description: "We're having trouble loading your education. Please refresh the page or try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      educationLevel: "",
      startDate: "",
      endDate: "",
      school: "",
      fieldOfStudy: "",
    });
    setShowDialog(true);
  };

  const handleEditClick = (education: Education) => {
    setEditingId(education.id);
    setFormData({
      educationLevel: typeof education.educationLevel === 'number' ? reverseEducationLevelMap[education.educationLevel] : education.educationLevel,
      startDate: education.startDate.split("T")[0],
      endDate: education.endDate.split("T")[0],
      school: education.school,
      fieldOfStudy: education.fieldOfStudy,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this education record?")) return;

    try {
      const response = await apiFetch(
        `/api/users/education/${id}`,
        { method: "DELETE" }
      );

      if (response.ok || response.status === 200 || response.status === 204) {
        setEducations(educations.filter((e) => e.id !== id));
        toast({
          title: "Success",
          description: "Education deleted successfully",
        });
      } else if (isAuthExpired(response)) {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again to continue.",
          variant: "destructive",
        });
      } else {
        let errorMessage = "Failed to delete education";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // Response is not JSON
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting education:", error);
      toast({
        title: "Error",
        description: "Failed to delete education",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.educationLevel || !formData.startDate || !formData.endDate || !formData.school || !formData.fieldOfStudy) {
      toast({
        title: "Required Fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: any = {
        educationLevel: formData.educationLevel,
        startDate: formData.startDate,
        endDate: formData.endDate,
        School: formData.school,
        FieldOfStudy: formData.fieldOfStudy,
      };

      if (editingId) {
        // Update existing
        const response = await apiFetch(
          `/api/users/education/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          let updated: any = null;
          try {
            updated = await response.json();
          } catch (e) {
            // No JSON response body
            updated = payload;
          }

          const eduLevel = updated.educationLevel || updated.EducationLevel || payload.educationLevel;
          const itemWithId = {
            ...educations.find((e) => e.id === editingId),
            ...updated,
            id: updated.id || updated.educationId || updated.EducationId || editingId,
            educationLevel: typeof eduLevel === 'number' ? (reverseEducationLevelMap[eduLevel] || eduLevel) : eduLevel,
            school: updated.school || updated.School || payload.School,
            startDate: updated.startDate || updated.StartDate || payload.startDate,
            endDate: updated.endDate || updated.EndDate || payload.endDate,
            fieldOfStudy: updated.fieldOfStudy || updated.FieldOfStudy || payload.FieldOfStudy,
          };
          setEducations(
            educations.map((e) => (e.id === editingId ? itemWithId : e))
          );
          toast({
            title: "Success",
            description: "Education updated successfully",
          });
          setShowDialog(false);
        } else if (isAuthExpired(response)) {
          toast({
            title: "Session expired",
            description: "Your session has expired. Please log in again to continue.",
            variant: "destructive",
          });
        } else {
          let errorMessage = "Failed to update education";
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
          "/api/users/education/add-education",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          const created = await response.json();
          const eduLevel = created.educationLevel || created.EducationLevel || payload.educationLevel;
          const itemWithId = {
            ...created,
            id: created.id || created.educationId || created.EducationId,
            educationLevel: typeof eduLevel === 'number' ? (reverseEducationLevelMap[eduLevel] || eduLevel) : eduLevel,
            school: created.school || created.School || payload.School,
            startDate: created.startDate || created.StartDate || payload.startDate,
            endDate: created.endDate || created.EndDate || payload.endDate,
            fieldOfStudy: created.fieldOfStudy || created.FieldOfStudy || payload.FieldOfStudy,
          };
          setEducations([...educations, itemWithId]);
          toast({
            title: "Success",
            description: "Education added successfully",
          });
          setShowDialog(false);
        } else if (isAuthExpired(response)) {
          toast({
            title: "Session expired",
            description: "Your session has expired. Please log in again to continue.",
            variant: "destructive",
          });
        } else {
          let errorMessage = "Failed to add education";
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
      console.error("Error submitting education:", error);
      toast({
        title: "Error",
        description: "Failed to submit education",
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
      {educations.length === 0 && !loading && (
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground mb-4">No education records yet</p>
            <Button
              onClick={handleAddClick}
              variant="outline"
              className="text-logo-blue border-logo-blue hover:bg-logo-blue/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Education
            </Button>
          </CardContent>
        </Card>
      )}

      {educations.length > 0 && (
        <div className="flex justify-start">
          <div className="flex flex-col gap-6 w-full md:w-1/2">
            {educations.map((education) => (
              <Card key={education.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative group">
                <div className="absolute top-4 right-4 flex gap-1 z-10">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditClick(education)}
                    className="text-slate-400 hover:text-logo-blue hover:bg-logo-blue/5 rounded-full h-8 w-8 bg-white shadow-sm border border-slate-100"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(education.id)}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8 bg-white shadow-sm border border-slate-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardHeader className="pb-3 pt-6 px-6">
                  <div className="space-y-2">
                    <CardTitle className="text-base font-bold text-slate-900 leading-tight pr-16">
                      {education.educationLevel}
                    </CardTitle>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-logo-blue">{education.school}</span>
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <span>{new Date(education.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                        <span className="mx-1">—</span>
                        <span>{new Date(education.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 flex-1">
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{education.fieldOfStudy}</p>
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
              {editingId ? "Update Education" : "Add Education"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update your education details"
                : "Add a new education entry"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="level">Education Level *</Label>
              <Select
                value={formData.educationLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, educationLevel: value })
                }
                disabled={loadingLevels}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">School/University *</Label>
              <Input
                id="school"
                placeholder="Enter school or university name"
                value={formData.school}
                onChange={(e) =>
                  setFormData({ ...formData, school: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="field">Field of Study *</Label>
              <Input
                id="field"
                placeholder="e.g., Computer Science"
                value={formData.fieldOfStudy}
                onChange={(e) =>
                  setFormData({ ...formData, fieldOfStudy: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
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
                <Label htmlFor="endDate">End Date *</Label>
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
                {editingId ? "Update" : "Add"} Education
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default UserEducation;
