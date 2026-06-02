import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WaitingListFormProps {
  onSuccess?: () => void;
  initialCourseId?: number;
  title?: string;
  description?: string;
}

interface Course {
  id?: number;
  courseId?: number;
  name: string;
}

interface Cohort {
  value: string;
  label: string;
}


export function WaitingListForm({
  onSuccess,
  initialCourseId = 0,
  title,
  description
}: WaitingListFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId > 0 ? initialCourseId.toString() : "");
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await apiFetch("/api/courses/get-courses");
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          const coursesList = Array.isArray(coursesData) ? coursesData : (coursesData.data || coursesData.courses || coursesData.items || coursesData.results || []);
          setCourses(coursesList);
        }

        // Fetch cohorts
        try {
          const cohortsResponse = await fetch("https://skillgo.africa/staging/api/waiting-list/cohorts", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log("Cohorts response status:", cohortsResponse.status);

          if (cohortsResponse.ok) {
            const cohortsData = await cohortsResponse.json();
            console.log("Cohorts raw data:", cohortsData);

            const cohortsList = Array.isArray(cohortsData) ? cohortsData : (cohortsData.data || cohortsData.cohorts || cohortsData.items || cohortsData.results || []);
            console.log("Parsed cohorts list:", cohortsList);

            if (cohortsList.length > 0) {
              setCohorts(cohortsList);
            } else {
              console.warn("Cohorts endpoint returned empty array");
            }
          } else {
            console.error("Cohorts endpoint error:", cohortsResponse.status, cohortsResponse.statusText);
            const errorData = await cohortsResponse.text();
            console.error("Cohorts error response body:", errorData);
          }
        } catch (error) {
          console.error("Cohorts fetch error:", error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phoneNumber || !selectedCourseId || !selectedCohortId) {
      toast({
        title: "Required Fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch("api/waiting-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phoneNumber,
          courseId: parseInt(selectedCourseId, 10),
          cohort: selectedCohortId,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Success!",
          description: "You've been added to the waiting list.",
        });

        // Navigate to payment page after showing success message
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate("/payment");
          }
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error("Please sign in to join the waiting list.");
        }
        throw new Error(errorData.message || "Failed to join waiting list. Please try again later.");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Successfully Added!</h3>
          <p className="text-slate-600">
            Thank you for your commitment to Learn and Grow in the AI era. You will receive an email from us within 24 hours.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-4">
          <Button
            onClick={() => navigate("/payment")}
            className="bg-gradient-to-r from-logo-gold to-logo-gold hover:from-logo-gold/90 hover:to-logo-gold/90 text-white font-semibold"
          >
            Pay Now
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          Complete your payment to secure your spot in the cohort.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isSuccess && (title || description) && (
        <DialogHeader className="text-center sm:text-center pb-2">
          {title && (
            <DialogTitle className="text-2xl font-bold bg-gradient-to-br from-logo-blue to-logo-gold bg-clip-text text-transparent">
              {title}
            </DialogTitle>
          )}
          {description && (
            <DialogDescription className="text-center">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="waiting-list-email" className="text-sm font-semibold">Email Address</Label>
        <Input
          id="waiting-list-email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="waiting-list-phone" className="text-sm font-semibold">Phone Number</Label>
        <Input
          id="waiting-list-phone"
          type="tel"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="waiting-list-course" className="text-sm font-semibold">Course of Interest</Label>
        <Select
          value={selectedCourseId}
          onValueChange={setSelectedCourseId}
          disabled={isLoading}
        >
          <SelectTrigger id="waiting-list-course">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.length > 0 ? (
              courses
                .filter((course) => course && (course.id !== undefined || course.courseId !== undefined))
                .map((course) => {
                  const id = course.id || course.courseId;
                  return (
                    <SelectItem key={id} value={String(id)}>
                      {course.name || "Unnamed Course"}
                    </SelectItem>
                  );
                })
            ) : (
              <SelectItem value="0" disabled>No courses available</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="waiting-list-cohort" className="text-sm font-semibold">Cohort</Label>
        <Select
          value={selectedCohortId}
          onValueChange={setSelectedCohortId}
          disabled={isLoading}
        >
          <SelectTrigger id="waiting-list-cohort">
            <SelectValue placeholder="Select a cohort" />
          </SelectTrigger>
          <SelectContent>
            {cohorts.map((cohort) => (
              <SelectItem key={cohort.value} value={cohort.value}>
                {cohort.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-logo-gold to-logo-blue hover:from-logo-gold/90 hover:to-logo-blue/90 text-white font-bold py-6 shadow-lg transition-all duration-200"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining...
          </>
        ) : (
          "Join Waiting List"
        )}
      </Button>
    </form>
    </div>
  );
}
