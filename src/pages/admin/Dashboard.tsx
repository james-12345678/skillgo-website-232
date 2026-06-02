import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch, isAuthExpired } from "@/lib/api";
import { ALL_COUNTRIES } from "@/lib/countries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  MessageSquare,
  BookOpen,
  Settings,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Database,
  Globe,
  Quote,
  Calendar,
  Key,
  Newspaper,
} from "lucide-react";
import { BlogManagement } from "@/components/admin/BlogManagement";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WaitingUser {
  waitingListId: number;
  email: string;
  phoneNumber: string;
  courseId: number;
  course_id?: number;
  courseName?: string;
  CourseName?: string;
  course_name?: string;
  cohortId?: number;
  cohort_id?: number;
  cohort?: string;
  cohortName?: string;
  CohortName?: string;
  cohort_name?: string;
}

interface UserFeedback {
  id?: number;
  country: number;
  message: string;
}

interface Course {
  courseId: number;
  name: string;
}

interface RecruiterEye {
  recruiterEyeId: number;
  id?: number;
  name: string;
  overview: string;
}

interface OverviewSection {
  title: string;
  content: string;
}

const overviewSectionOrder = ["Skills Employers Want", "Tools", "Possible Projects"] as const;

type OverviewSectionTitle = (typeof overviewSectionOrder)[number];

const overviewSectionMatchers: Array<{ title: OverviewSectionTitle; regex: RegExp }> = [
  {
    title: "Possible Projects",
    regex: /(?:Possible Projects(?:\s*\([^)]*\))?|Uploadable Projects)(?:\s*:?)/i,
  },
  {
    title: "Skills Employers Want",
    regex: /Skills Employers Want(?:\s*\([^)]*\))?(?:\s*:?)/i,
  },
  {
    title: "Tools",
    regex: /Tools(?: to use)?(?:\s*\([^)]*\))?(?:\s*:?)/i,
  },
];

const splitSectionContent = (content: string): string[] => {
  const normalized = content.replace(/\r/g, " ").trim();
  if (!normalized) return [];

  return normalized
    .split(/(?:\n+|\s{2,}|\s*[•·▪]\s*)/g)
    .map((item) => item.replace(/\s+([,.)\]])/g, "$1").trim())
    .filter(Boolean);
};

const parseOverviewSections = (overview: string): OverviewSection[] => {
  const rawOverview = overview.replace(/\r/g, "").trim();
  if (!rawOverview) {
    return overviewSectionOrder.map((title) => ({ title, content: "" }));
  }

  const matches = overviewSectionMatchers
    .map(({ title, regex }) => {
      const match = regex.exec(rawOverview);
      if (!match || match.index === undefined) return null;

      return {
        title,
        start: match.index,
        end: match.index + match[0].length,
      };
    })
    .filter((match): match is { title: OverviewSectionTitle; start: number; end: number } => Boolean(match))
    .sort((a, b) => a.start - b.start);

  const getSectionContent = (title: OverviewSectionTitle) => {
    const match = matches.find((item) => item.title === title);

    if (title === "Possible Projects" && !match) {
      const nextMatch = matches[0];
      return rawOverview.slice(0, nextMatch?.start ?? rawOverview.length).trim();
    }

    if (!match) return "";

    const nextMatch = matches.find((item) => item.start > match.start);
    return rawOverview.slice(match.end, nextMatch?.start ?? rawOverview.length).trim();
  };

  return overviewSectionOrder.map((title) => ({
    title,
    content: getSectionContent(title),
  }));
};

const RecruiterOverviewContent = ({ overview }: { overview: string }) => {
  const sections = parseOverviewSections(overview);

  return (
    <div className="grid gap-3 auto-cols-fr grid-cols-3">
      {sections.map((section) => (
        <div key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-logo-blue font-poppins">
            {section.title}
          </p>
          <ul className="mt-3 space-y-2">
            {(() => {
              const points = splitSectionContent(section.content);
              return points.length > 0 ? (
                points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm leading-6 text-slate-600 font-poppins">
                    <span className="mt-2 h-2 w-2 rounded-full bg-logo-gold flex-shrink-0" />
                    <span className="whitespace-pre-wrap">{point}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm leading-6 text-slate-500 font-poppins whitespace-pre-wrap">No details available.</li>
              );
            })()}
          </ul>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleTokenExpired = () => {
    logout();
    toast({
      title: "Session expired",
      description: "Your session has expired. Please log in again.",
      variant: "destructive",
    });
    navigate("/signin", { replace: true });
  };

  const [waitingList, setWaitingList] = useState<WaitingUser[]>([]);
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recruiterEyes, setRecruiterEyes] = useState<RecruiterEye[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("waiting-list");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [analyticsDaily, setAnalyticsDaily] = useState<any[]>([]);
  const [analyticsWeekly, setAnalyticsWeekly] = useState<any[]>([]);
  const [analyticsMonthly, setAnalyticsMonthly] = useState<any[]>([]);
  const [analyticsTotal, setAnalyticsTotal] = useState(0);

  const [analyticsFromDate, setAnalyticsFromDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date.toISOString().split('T')[0];
  });
  const [analyticsToDate, setAnalyticsToDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [waitingListPage, setWaitingListPage] = useState(1);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [coursesPage, setCoursesPage] = useState(1);
  const [recruiterEyesPage, setRecruiterEyesPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [hasMoreWaitingList, setHasMoreWaitingList] = useState(true);
  const [hasMoreFeedback, setHasMoreFeedback] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/signin", { replace: true });
  };

  // Form states for adding/editing courses
  const [newCourse, setNewCourse] = useState({ name: "" });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states for adding/editing recruiter eyes
  const [newRecruiterEye, setNewRecruiterEye] = useState({ name: "", overview: "" });
  const [editingRecruiterEye, setEditingRecruiterEye] = useState<RecruiterEye | null>(null);
  const [isRecruiterEyeDialogOpen, setIsRecruiterEyeDialogOpen] = useState(false);

  const [waitingListCourseMap, setWaitingListCourseMap] = useState<Record<string, string>>({});

  // State for unique codes generation
  const [uniqueCodesCount, setUniqueCodesCount] = useState(10);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const resolveCourseName = (user: any, coursesList: Course[], map: Record<string, string>): string => {
    if (!user) return "N/A";

    const cid = user.courseId;
    console.log(`[resolveCourseName] Looking up courseId: ${cid}`, { mapKeys: Object.keys(map) });

    if (cid !== null && cid !== undefined) {
      const idStr = String(cid);
      if (map[idStr]) {
        console.log(`[resolveCourseName] Found in map: ${map[idStr]}`);
        return map[idStr];
      }

      // Secondary check: look through the actual courses array
      const found = coursesList.find(c => {
        if (!c) return false;
        return String(c.courseId) === idStr;
      });
      if (found) {
        console.log(`[resolveCourseName] Found in list: ${found.name}`);
        return found.name;
      }

      console.log(`[resolveCourseName] NO MATCH for id: ${idStr}`);
      return idStr;
    }

    return "N/A";
  };

  const extractList = (data: any): any[] => {
    console.log("extractList input:", data);
    if (Array.isArray(data)) return data;
    if (!data) return [];

    const tryParseObject = (obj: any): any[] | null => {
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        const keys = Object.keys(obj);
        const allNumericKeys = keys.length > 0 && keys.every(k => !isNaN(Number(k)) || /^\d+$/.test(k));
        if (allNumericKeys) {
          return keys.map(k => {
            const val = obj[k];
            if (typeof val === 'string') return { id: k, name: val };
            if (typeof val === 'object' && val !== null) return { id: k, ...val };
            return { id: k };
          });
        }
      }
      return null;
    };

    const parsed = tryParseObject(data);
    if (parsed) return parsed;

    // Look for any property that is an array
    const values = Object.values(data);
    const arrays = values.filter(v => Array.isArray(v));
    if (arrays.length === 1) return arrays[0];

    // If multiple arrays, try to find one that looks like what we want
    if (arrays.length > 1) {
      const likely = arrays.find(arr => {
        const first = arr[0];
        if (!first) return false;
        const keys = Object.keys(first).map(k => k.toLowerCase());
        return keys.includes('name') || keys.includes('email') || keys.includes('message') || keys.includes('recruiterayeid');
      });
      if (likely) return likely;
    }

    const potential = data.data || data.items || data.results || data.courses || data.waitingList || data.feedback || data.Courses || data.WaitingList || (data as any).data?.data;
    if (potential) {
      if (Array.isArray(potential)) return potential;
      const nestedParsed = tryParseObject(potential);
      if (nestedParsed) return nestedParsed;
      if (typeof potential === 'object') {
        const nested = potential.data || potential.items || potential.results || potential.courses || (potential as any).Courses;
        if (Array.isArray(nested)) return nested;
        const twiceNestedParsed = tryParseObject(nested);
        if (twiceNestedParsed) return twiceNestedParsed;
      }
    }
    return Array.isArray(data) ? data : [];
  };

  const fillMissingDates = (data: any[], startDate: Date, endDate: Date): any[] => {
    const filled: any[] = [];
    const dataMap = new Map(data.map(d => [d.period, d.count]));

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const period = d.toISOString().split('T')[0];
      filled.push({
        period,
        count: dataMap.get(period) || 0
      });
    }
    return filled;
  };

  const fetchAnalytics = async (fromDate: string = analyticsFromDate, toDate: string = analyticsToDate, isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);
    try {
      // Convert date strings to ISO datetime
      const fromParam = new Date(fromDate).toISOString();
      const toParam = new Date(toDate);
      toParam.setHours(23, 59, 59, 999);
      const toParamStr = toParam.toISOString();

      const analyticsRes = await apiFetch(`https://skillgo.africa/staging/api/projects/analytics/completed-sessions?From=${encodeURIComponent(fromParam)}&To=${encodeURIComponent(toParamStr)}`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        console.log("Analytics API Response:", analyticsData);

        // Extract and fill missing dates for daily data
        const dailyData = fillMissingDates(analyticsData.daily || [], new Date(fromDate), new Date(toDate));
        const weeklyData = analyticsData.weekly || [];
        const monthlyData = analyticsData.monthly || [];
        const total = analyticsData.total || 0;

        setAnalyticsDaily(dailyData);
        setAnalyticsWeekly(weeklyData);
        setAnalyticsMonthly(monthlyData);
        setAnalyticsTotal(total);
        setAnalytics(dailyData);
      } else if (isAuthExpired(analyticsRes)) {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again to continue.",
          variant: "destructive",
        });
      } else {
        toast.error(`Failed to load analytics: ${analyticsRes.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Error loading analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        console.warn("No auth_token found in localStorage before fetching courses.");
      }

      const coursesRes = await apiFetch("api/courses/get-courses", {
        headers: { "Accept": "*/*" }
      });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        console.log("Courses API Response:", coursesData);
        const currentCourses = extractList(coursesData);
        setCourses(currentCourses);

        const courseMap: Record<string, string> = {};
        currentCourses.forEach(c => {
          if (!c) return;
          // Strictly use courseId as per user's requirement
          const id = c.courseId;
          const name = c.name;
          if (id !== undefined && id !== null && name) {
            courseMap[String(id)] = name;
          }
        });
        console.log("Generated Course Map:", courseMap);
        setWaitingListCourseMap(courseMap);
        return { currentCourses, courseMap };
      } else if (isAuthExpired(coursesRes)) {
        const storedToken = localStorage.getItem('auth_token');
        console.error("Courses auth failed (401):", {
          tokenExists: !!storedToken,
          tokenLength: storedToken?.length,
          statusText: coursesRes.statusText
        });
        handleTokenExpired();
      } else {
        console.error("Courses response not OK:", coursesRes.status);
        toast({
          title: "Error loading courses",
          description: `Failed to load courses (${coursesRes.status}). Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast({
        title: "Error loading courses",
        description: "An error occurred while loading courses.",
        variant: "destructive",
      });
    }
    return { currentCourses: [], courseMap: {} };
  };

  const fetchRecruiterEyes = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        console.warn("No auth_token found in localStorage before fetching recruiter eyes.");
      }

      const recruiterEyesRes = await apiFetch(`api/recruiter-eye?pageNumber=${recruiterEyesPage}&pageSize=${ITEMS_PER_PAGE}`, {
        headers: { "Accept": "*/*" }
      });
      if (recruiterEyesRes.ok) {
        const recruiterEyesData = await recruiterEyesRes.json();
        console.log("Recruiter Eyes API Response:", recruiterEyesData);
        const currentRecruiterEyes = extractList(recruiterEyesData);
        console.log("Extracted Recruiter Eyes:", currentRecruiterEyes);
        if (currentRecruiterEyes.length > 0) {
          console.log("First item keys:", Object.keys(currentRecruiterEyes[0]));
          console.log("First item:", currentRecruiterEyes[0]);
        }
        // Ensure each recruiter eye has an 'id' field for table operations
        const normalizedEyes = currentRecruiterEyes.map((eye: any) => {
          // Use recruiterEyeId from the API response and map to id for consistency
          const idValue = eye.recruiterEyeId || eye.id;
          console.log("Processing recruiter eye:", eye, "recruiterEyeId:", idValue);
          return {
            ...eye,
            id: idValue, // Map recruiterEyeId to id for compatibility with UI
            recruiterEyeId: idValue, // Keep the original field as well
          };
        });
        console.log("Normalized Recruiter Eyes:", normalizedEyes);
        setRecruiterEyes(normalizedEyes);
        return normalizedEyes;
      } else if (isAuthExpired(recruiterEyesRes)) {
        const storedToken = localStorage.getItem('auth_token');
        console.error("Recruiter eyes auth failed (401):", {
          tokenExists: !!storedToken,
          tokenLength: storedToken?.length,
          statusText: recruiterEyesRes.statusText
        });
        handleTokenExpired();
      }
    } catch (error) {
      console.error("Failed to fetch recruiter eyes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    return [];
  };

  const fetchFeedback = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);
    try {
      const feedbackRes = await apiFetch(`api/feedback?pageNumber=${feedbackPage}&pageSize=${ITEMS_PER_PAGE}`);
      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json();
        const list = extractList(feedbackData);
        setFeedback(list);
        setHasMoreFeedback(list.length === ITEMS_PER_PAGE);
      } else if (isAuthExpired(feedbackRes)) {
        console.error("Feedback auth failed (401)");
        setFeedback([]);
        handleTokenExpired();
      } else {
        console.error("Feedback response not OK:", feedbackRes.status);
        setFeedback([]);
        toast({
          title: "Error loading feedback",
          description: `Failed to load feedback (${feedbackRes.status}). Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      setFeedback([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWaitingList = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        console.warn("No auth_token found in localStorage before fetching waiting list.");
      }

      // Ensure courses are available for mapping
      let currentCourses = courses;
      let courseMap = waitingListCourseMap;

      // Force refresh of courses if map is empty to ensure we have mapping data
      if (currentCourses.length === 0 || Object.keys(courseMap).length === 0) {
        console.log("Course map empty, fetching courses first...");
        const result = await fetchCourses();
        currentCourses = result.currentCourses;
        courseMap = result.courseMap;
      }

      const waitingRes = await apiFetch(`api/waiting-list?pageNumber=${waitingListPage}&pageSize=${ITEMS_PER_PAGE}`);
      if (waitingRes.ok) {
        const waitingData = await waitingRes.json();
        console.log("Waiting List API Response:", waitingData);
        const rawWaitingList = extractList(waitingData);
        const validList = rawWaitingList.filter(u => u && u.email && u.email.includes('@'));

        const enriched = validList.map((user: any) => {
          console.log("Processing user entry for mapping:", user);
          return {
            ...user,
            courseName: resolveCourseName(user, currentCourses, courseMap)
          };
        });
        console.log("Enriched Waiting List:", enriched);
        setWaitingList(enriched);
        setHasMoreWaitingList(rawWaitingList.length === ITEMS_PER_PAGE);
      } else if (isAuthExpired(waitingRes)) {
        const storedToken = localStorage.getItem('auth_token');
        const errorBody = await waitingRes.text().catch(() => 'unable to read response');
        console.error("Waiting list auth failed (401):", {
          tokenExists: !!storedToken,
          tokenLength: storedToken?.length,
          statusText: waitingRes.statusText,
          endpoint: `api/waiting-list?pageNumber=${waitingListPage}&pageSize=${ITEMS_PER_PAGE}`,
          errorBody: errorBody.substring(0, 200)
        });
        setWaitingList([]);
        handleTokenExpired();
      } else {
        console.error("Waiting list response not OK:", waitingRes.status, waitingRes.statusText);
        setWaitingList([]);
        toast({
          title: "Error loading waiting list",
          description: `Failed to load waiting list (${waitingRes.status}). Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch waiting list:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWaitingList();
  }, [waitingListPage]);

  useEffect(() => {
    fetchFeedback();
  }, [feedbackPage]);

  useEffect(() => {
    fetchRecruiterEyes();
  }, [recruiterEyesPage]);

  useEffect(() => {
    fetchAnalytics(analyticsFromDate, analyticsToDate);
    fetchCourses();
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await apiFetch("/api/blogs");
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Unauthorized. You must be logged in as an admin.");
        } else {
          throw new Error("Failed to fetch blogs");
        }
        setBlogs([]);
        return;
      }
      const data = await response.json();
      let blogList = Array.isArray(data) ? data : (data?.items || []);
      blogList = blogList.map(blog => ({
        ...blog,
        id: blog.id || blog.blogId,
      }));
      setBlogs(blogList);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const res = await apiFetch("api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });
      if (res.ok) {
        toast.success("Course created successfully");
        setNewCourse({ name: "" });
        setIsDialogOpen(false);
        fetchCourses();
      } else {
        toast.error("Failed to create course");
      }
    } catch (error) {
      toast.error("Network error creating course");
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    try {
      const courseId = editingCourse.courseId;
      const res = await apiFetch(`api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCourse),
      });
      if (res.ok) {
        toast.success("Course updated successfully");
        setEditingCourse(null);
        fetchCourses();
      } else {
        toast.error("Failed to update course");
      }
    } catch (error) {
      toast.error("Network error updating course");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await apiFetch(`api/courses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Course deleted successfully");
        fetchCourses();
      } else {
        toast.error("Failed to delete course");
      }
    } catch (error) {
      toast.error("Network error deleting course");
    }
  };

  const handleCreateRecruiterEye = async () => {
    try {
      const res = await apiFetch("api/recruiter-eye", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecruiterEye),
      });
      if (res.ok) {
        const createdData = await res.json();
        console.log("Created Recruiter Eye response:", createdData);
        console.log("Response keys:", createdData ? Object.keys(createdData) : 'null/undefined');
        toast.success("Recruiter Eye created successfully");
        setNewRecruiterEye({ name: "", overview: "" });
        setIsRecruiterEyeDialogOpen(false);
        fetchRecruiterEyes();
      } else {
        toast.error("Failed to create Recruiter Eye");
      }
    } catch (error) {
      toast.error("Network error creating Recruiter Eye");
    }
  };

  const handleUpdateRecruiterEye = async () => {
    if (!editingRecruiterEye) return;
    try {
      const recruiterEyeId = editingRecruiterEye.recruiterEyeId || editingRecruiterEye.id;
      console.log("Updating recruiter eye with ID:", recruiterEyeId);
      const res = await apiFetch(`api/recruiter-eye/${recruiterEyeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRecruiterEye),
      });
      if (res.ok) {
        toast.success("Recruiter Eye updated successfully");
        setEditingRecruiterEye(null);
        fetchRecruiterEyes();
      } else {
        toast.error("Failed to update Recruiter Eye");
      }
    } catch (error) {
      toast.error("Network error updating Recruiter Eye");
    }
  };

  const handleDeleteRecruiterEye = async (recruiterEye: RecruiterEye) => {
    if (!confirm("Are you sure you want to delete this Recruiter Eye?")) return;
    try {
      const deleteId = recruiterEye.recruiterEyeId || recruiterEye.id;
      console.log("Deleting recruiter eye with ID:", deleteId, "Full object:", recruiterEye);
      const res = await apiFetch(`api/recruiter-eye/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Recruiter Eye deleted successfully");
        fetchRecruiterEyes();
      } else {
        toast.error("Failed to delete Recruiter Eye");
      }
    } catch (error) {
      toast.error("Network error deleting Recruiter Eye");
    }
  };

  const handleGenerateUniqueCodes = async () => {
    if (uniqueCodesCount <= 0 || !Number.isInteger(uniqueCodesCount)) {
      toast.error("Please enter a valid number of codes to generate");
      return;
    }

    // Verify user is admin
    if (!user || String(user.role).toLowerCase() !== 'admin') {
      toast.error("Only admin users can generate codes");
      return;
    }

    setIsGeneratingCodes(true);
    try {
      const res = await apiFetch("/api/unique-codes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: uniqueCodesCount }),
      });

      if (res.ok) {
        const data = await res.json();
        // Handle both array response and object with codes property
        const codesArray = Array.isArray(data) ? data : (data.codes || []);
        // Extract code strings from objects if they have a code property
        const codeStrings = codesArray.map(item => typeof item === 'string' ? item : item.code);
        setGeneratedCodes(codeStrings);
        toast.success(`Successfully generated ${uniqueCodesCount} unique codes`);
      } else if (res.status === 401) {
        toast.error("Unauthorized: Please log in again");
        logout();
      } else {
        const errorData = await res.text();
        toast.error(`Failed to generate codes: ${errorData}`);
      }
    } catch (error) {
      console.error("Error generating codes:", error);
      toast.error("Network error generating codes");
    } finally {
      setIsGeneratingCodes(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-logo-blue" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-poppins bg-gradient-to-b from-slate-50/30 to-transparent min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black font-poppins">Admin Dashboard</h1>
          <p className="text-xs text-black mt-1 font-medium font-poppins">Manage courses, feedback, and analytics</p>
        </div>
        {refreshing && <Loader2 className="h-5 w-5 animate-spin text-logo-blue" />}
      </div>

      <div className="flex items-center justify-between bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-logo-blue/20 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-logo-blue to-logo-blue/70 text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-slate-900 font-poppins">{user?.name || "Admin User"}</p>
            <p className="text-xs text-slate-500 font-poppins">{user?.email || "admin@example.com"}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          className="bg-logo-blue text-white hover:bg-logo-blue/85 text-sm font-semibold rounded-lg py-2 transition-all"
        >
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-6 bg-transparent p-0 h-auto border-b border-slate-200/50 pb-4 font-poppins">
          <TabsTrigger
            value="analytics"
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-2 font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-logo-blue/10 data-[state=active]:text-logo-blue data-[state=active]:border-b-2 data-[state=active]:border-logo-blue border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 font-poppins text-xs sm:text-sm sm:whitespace-nowrap justify-center sm:justify-start"
          >
            <Database className="h-4 w-4" />
            <span className="text-center sm:text-left">Analytics</span>
            <span className="text-xs bg-logo-blue/10 text-logo-blue px-2 py-0.5 rounded-full ml-0 sm:ml-1 font-semibold">{analytics.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="waiting-list"
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-2 font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-logo-gold/10 data-[state=active]:text-logo-gold data-[state=active]:border-b-2 data-[state=active]:border-logo-gold border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 font-poppins text-xs sm:text-sm sm:whitespace-nowrap justify-center sm:justify-start"
          >
            <Users className="h-4 w-4" />
            <span className="text-center sm:text-left">Waiting List</span>
            <span className="text-xs bg-logo-gold/10 text-logo-gold px-2 py-0.5 rounded-full ml-0 sm:ml-1 font-semibold">{waitingList.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-2 font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-logo-blue/10 data-[state=active]:text-logo-blue data-[state=active]:border-b-2 data-[state=active]:border-logo-blue border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 font-poppins text-xs sm:text-sm sm:whitespace-nowrap justify-center sm:justify-start"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-center sm:text-left">Feedback</span>
            <span className="text-xs bg-logo-blue/10 text-logo-blue px-2 py-0.5 rounded-full ml-0 sm:ml-1 font-semibold">{feedback.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-2 font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-logo-gold/10 data-[state=active]:text-logo-gold data-[state=active]:border-b-2 data-[state=active]:border-logo-gold border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 font-poppins text-xs sm:text-sm sm:whitespace-nowrap justify-center sm:justify-start"
          >
            <BookOpen className="h-4 w-4" />
            <span className="text-center sm:text-left">Courses</span>
            <span className="text-xs bg-logo-gold/10 text-logo-gold px-2 py-0.5 rounded-full ml-0 sm:ml-1 font-semibold">{courses.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="recruiter-eye"
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-2 font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-logo-gold/10 data-[state=active]:text-logo-gold data-[state=active]:border-b-2 data-[state=active]:border-logo-gold border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 font-poppins text-xs sm:text-sm sm:whitespace-nowrap justify-center sm:justify-start"
          >
            <Globe className="h-4 w-4" />
            <span className="text-center sm:text-left">Recruiter Eye</span>
            <span className="text-xs bg-logo-gold/10 text-logo-gold px-2 py-0.5 rounded-full ml-0 sm:ml-1 font-semibold">{recruiterEyes.length}</span>
          </TabsTrigger>
          <TabsTrigger
            value="unique-codes"
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-2 font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-logo-blue/10 data-[state=active]:text-logo-blue data-[state=active]:border-b-2 data-[state=active]:border-logo-blue border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 font-poppins text-xs sm:text-sm sm:whitespace-nowrap justify-center sm:justify-start"
          >
            <Key className="h-4 w-4" />
            <span className="text-center sm:text-left">Unique Codes</span>
          </TabsTrigger>
          <TabsTrigger
            value="blogs"
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-2 font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-logo-gold/10 data-[state=active]:text-logo-gold data-[state=active]:border-b-2 data-[state=active]:border-logo-gold border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 font-poppins text-xs sm:text-sm sm:whitespace-nowrap justify-center sm:justify-start"
          >
            <Newspaper className="h-4 w-4" />
            <span className="text-center sm:text-left">Blogs</span>
            <span className="text-xs bg-logo-gold/10 text-logo-gold px-2 py-0.5 rounded-full ml-0 sm:ml-1 font-semibold">{blogs.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-6">
          {/* Date Range Selector */}
          <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-logo-blue/5 via-logo-gold/3 to-transparent pb-6 border-b border-logo-blue/10">
              <CardTitle className="text-base font-bold text-slate-900 font-poppins flex items-center gap-2">
                <Calendar className="h-5 w-5 text-logo-blue" />
                Select Date Range
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700 font-poppins">From Date</Label>
                  <Input
                    type="date"
                    value={analyticsFromDate}
                    onChange={(e) => setAnalyticsFromDate(e.target.value)}
                    className="border-slate-200 focus:border-logo-blue focus:ring-logo-blue/20 rounded-xl font-poppins"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-semibold text-slate-700 font-poppins">To Date</Label>
                  <Input
                    type="date"
                    value={analyticsToDate}
                    onChange={(e) => setAnalyticsToDate(e.target.value)}
                    className="border-slate-200 focus:border-logo-blue focus:ring-logo-blue/20 rounded-xl font-poppins"
                  />
                </div>
                <Button
                  onClick={() => fetchAnalytics(analyticsFromDate, analyticsToDate)}
                  className="bg-logo-blue text-white hover:bg-logo-blue/90 font-semibold rounded-lg shadow-sm transition-all font-poppins"
                >
                  Generate Report
                </Button>
                {refreshing && <Loader2 className="h-5 w-5 animate-spin text-logo-gold" />}
              </div>
            </CardContent>
          </Card>

          {/* KPI Card */}
          <Card className="border border-logo-blue/20 shadow-sm rounded-xl overflow-hidden bg-gradient-to-br from-logo-blue/5 via-logo-gold/3 to-slate-50 hover:shadow-md transition-shadow">
            <CardContent className="px-6 sm:px-8 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-600 font-poppins uppercase tracking-wider">Total Completed Sessions</p>
                  <p className="text-5xl font-black text-logo-blue font-poppins mt-2">{analyticsTotal.toLocaleString()}</p>
                </div>
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-logo-blue to-logo-blue/70 flex items-center justify-center shadow-lg">
                  <Database className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Chart */}
          <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-logo-blue/5 via-logo-gold/3 to-transparent pb-6 border-b border-logo-blue/10">
              <CardTitle className="text-base font-bold text-slate-900 font-poppins">Daily Completed Sessions</CardTitle>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 py-8">
              {analyticsDaily.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsDaily} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="period" stroke="#64748b" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        cursor={{ stroke: '#0066cc', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#0066cc"
                        dot={{ fill: '#0066cc', r: 4 }}
                        activeDot={{ r: 6 }}
                        strokeWidth={2}
                        name="Sessions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No data available for the selected date range
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly & Monthly Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Chart */}
            <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-slate-50/50 to-transparent pb-6 border-b border-slate-100/50">
                <CardTitle className="text-base font-bold text-slate-900 font-poppins">Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-6 sm:px-8 py-8">
                {analyticsWeekly.length > 0 ? (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsWeekly} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="period" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#0066cc"
                          radius={[8, 8, 0, 0]}
                          name="Sessions"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No weekly data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Chart */}
            <Card className="border border-logo-gold/20 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-logo-gold/5 to-transparent pb-6 border-b border-logo-gold/10">
                <CardTitle className="text-base font-bold text-slate-900 font-poppins">Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-6 sm:px-8 py-8">
                {analyticsMonthly.length > 0 ? (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsMonthly} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="period" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#d4a574"
                          radius={[8, 8, 0, 0]}
                          name="Sessions"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No monthly data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="waiting-list" className="animate-in fade-in slide-in-from-left-4 duration-500">
          <Card className="border border-logo-gold/20 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-logo-gold/5 to-transparent pb-6 border-b border-logo-gold/10">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900 font-poppins flex items-center gap-3">
                  <Users className="h-5 w-5 text-logo-gold" />
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px]">
                <BookOpen className="h-4 w-4 text-logo-gold" />
                <Select value={selectedCourse} onValueChange={(val) => {
                  setSelectedCourse(val);
                  setWaitingListPage(1);
                }}>
                  <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl font-semibold text-slate-700 shadow-sm focus:ring-logo-blue/20 transition-all duration-300 font-poppins">
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-lg font-poppins">
                    <SelectItem value="all" className="font-semibold font-poppins">All Courses</SelectItem>
                    {courses.filter(course => {
                      if (!course) return false;
                      const cid = course.courseId;
                      return cid !== undefined && cid !== null;
                    }).map((course, index) => {
                      const cid = course.courseId ?? index;
                      return (
                        <SelectItem key={String(cid)} value={String(cid)} className="font-medium font-poppins">
                          {course.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto w-full">
                <Table className="border-collapse font-poppins w-full">
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50/30 hover:bg-slate-50/30">
                      <TableHead className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-poppins">Email</TableHead>
                      <TableHead className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-poppins">Phone Number</TableHead>
                      <TableHead className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-poppins">Course Name</TableHead>
                      <TableHead className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-poppins">Cohort</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filtered = waitingList.filter(user => {
                        if (!user) return false;
                        const cid = user.courseId;
                        return selectedCourse === "all" || (cid !== undefined && cid !== null && String(cid) === selectedCourse);
                      });

                      return (
                        <>
                          {filtered.map((user, index) => {
                            const courseName = user.courseName || user.CourseName || user.course_name || "N/A";
                            const cohortName = user.cohort || user.cohortName || user.CohortName || user.cohort_name || "N/A";
                            return (
                              <TableRow key={user.waitingListId || `user-${index}`} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100/60">
                                <TableCell className="py-4 px-6 font-semibold text-slate-900 font-poppins text-sm">{user.email}</TableCell>
                                <TableCell className="py-4 px-6 font-medium text-slate-600 font-poppins text-sm">{user.phoneNumber}</TableCell>
                                <TableCell className="py-4 px-6">
                                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 font-bold px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-poppins">
                                    {courseName}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-4 px-6">
                                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 font-bold px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-poppins">
                                    {cohortName}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          <TableRow>
                            <TableCell colSpan={4} className="py-4 px-6">
                              <div className="flex items-center justify-between">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setWaitingListPage(p => Math.max(1, p - 1))}
                                  disabled={waitingListPage === 1}
                                  className="rounded-lg h-8 px-4 font-bold text-xs shadow-sm border-logo-blue/20 hover:bg-logo-blue hover:text-white text-logo-blue transition-all duration-300"
                                >
                                  Previous
                                </Button>
                                <span className="text-xs font-bold text-slate-500">Page {waitingListPage}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setWaitingListPage(p => p + 1)}
                                  disabled={!hasMoreWaitingList}
                                  className="rounded-lg h-8 px-4 font-bold text-xs shadow-sm border-logo-gold/20 hover:bg-logo-gold hover:text-white text-logo-gold transition-all duration-300"
                                >
                                  Next
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })()}
                    {waitingList.length === 0 && (
                      <TableRow key="no-waiting-list">
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No users in the waiting list.</TableCell>
                      </TableRow>
                    )}
                    {waitingList.length > 0 && waitingList.filter(user => user && (selectedCourse === "all" || String(user.courseId) === selectedCourse)).length === 0 && (
                      <TableRow key="no-filtered-results">
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No matches for the selected course.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="animate-in fade-in slide-in-from-right-4 duration-500">
          <Card className="border border-logo-blue/20 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-logo-blue/5 to-transparent pb-6 border-b border-logo-blue/10 px-6 sm:px-8">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 font-poppins flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-logo-blue" />
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[200px]">
                <Globe className="h-4 w-4 text-logo-gold" />
                <Select value={selectedCountry} onValueChange={(val) => {
                  setSelectedCountry(val);
                  setFeedbackPage(1);
                }}>
                  <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl font-semibold text-slate-700 shadow-sm focus:ring-logo-gold/20 transition-all duration-300 font-poppins">
                    <SelectValue placeholder="Filter by country" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-lg font-poppins">
                  <SelectItem value="all" className="font-semibold font-poppins">All Countries</SelectItem>
                  {Array.from(new Set(feedback.filter(f => f && f.country).map(f => String(f.country))))
                    .map(countryId => {
                      const country = ALL_COUNTRIES.find(c => c.id === countryId);
                      return country ? (
                        <SelectItem key={country.id} value={country.id} className="font-medium font-poppins">
                          {country.name}
                        </SelectItem>
                      ) : null;
                    })
                    .filter(Boolean)}
                </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-8">
              <div className="grid gap-6">
                {(() => {
                  const filtered = feedback.filter(fb => fb && (selectedCountry === "all" || String(fb.country) === selectedCountry));

                  if (filtered.length > 0) {
                    return (
                      <>
                        {filtered.map((fb, index) => {
                          const countryName = ALL_COUNTRIES.find(c => c.id === String(fb.country))?.name || `Country ID: ${fb.country}`;
                          return (
                            <Card key={fb.id || `fb-${index}`} className="border border-slate-100 hover:border-slate-200 transition-all duration-300 shadow-sm bg-white rounded-lg group hover:shadow-md">
                              <CardContent className="p-6">
                                <div className="flex items-start gap-6">
                                  <Avatar className="h-12 w-12 border border-slate-100 shadow-sm shrink-0 bg-slate-50">
                                    <AvatarFallback className="bg-slate-100 text-slate-400">
                                      <Users className="h-6 w-6" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-3">
                                        <span className="font-bold text-sm text-slate-900 font-poppins tracking-tight">Anonymous User</span>
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-poppins">
                                          <Globe className="h-3 w-3 mr-1.5 inline" />
                                          {countryName}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="relative">
                                      <Quote className="absolute -left-2 -top-2 h-4 w-4 text-slate-100 rotate-180" />
                                      <p className="text-sm text-slate-600 leading-relaxed pl-4 font-poppins font-medium">
                                        "{fb.message}"
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                        <div className="flex items-center justify-between mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFeedbackPage(p => Math.max(1, p - 1))}
                            disabled={feedbackPage === 1}
                            className="rounded-xl h-9 px-6 font-bold text-xs shadow-sm border-logo-blue/20 hover:bg-logo-blue hover:text-white text-logo-blue transition-all duration-300"
                          >
                            Previous
                          </Button>
                          <span className="text-xs font-bold text-slate-500">Page {feedbackPage}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFeedbackPage(p => p + 1)}
                            disabled={!hasMoreFeedback}
                            className="rounded-xl h-9 px-6 font-bold text-xs shadow-sm border-logo-gold/20 hover:bg-logo-gold hover:text-white text-logo-gold transition-all duration-300"
                          >
                            Next
                          </Button>
                        </div>
                      </>
                    );
                  }

                  return (
                    <Card className="border-dashed border-2 bg-muted/10">
                      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-muted-foreground font-medium">No feedback entries yet.</p>
                        <p className="text-xs text-muted-foreground/60 max-w-[200px] mt-1">Submitted user feedback will be displayed here.</p>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border border-logo-gold/20 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-logo-gold/5 to-transparent pb-6 border-b border-logo-gold/10 px-6 sm:px-8">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 font-poppins flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-logo-gold" />
                </CardTitle>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-logo-gold text-white hover:bg-logo-gold/90 font-semibold rounded-lg shadow-sm transition-all h-auto py-2.5 px-6 font-poppins">
                    <Plus className="h-4 w-4 mr-2" />
                    New Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-xl border-slate-200 font-poppins">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 font-poppins">Add New Course</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 font-poppins">
                    <div className="grid gap-2 font-poppins">
                      <Label htmlFor="name" className="text-logo-blue font-semibold font-poppins">Course Name</Label>
                      <Input
                        id="name"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                        className="border-slate-200 focus:border-logo-blue focus:ring-logo-blue/20 rounded-xl font-poppins"
                        placeholder="e.g. Fullstack Web Development"
                      />
                    </div>
                  </div>
                  <DialogFooter className="font-poppins">
                    <Button onClick={handleCreateCourse} className="bg-logo-gold text-white hover:bg-logo-gold/90 font-semibold rounded-lg font-poppins">Create Course</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto w-full">
                <Table className="border-collapse font-poppins w-full">
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 font-poppins">Name</TableHead>
                      <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right font-poppins">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filtered = courses.filter(Boolean);
                      const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                      const paginated = filtered.slice((coursesPage - 1) * ITEMS_PER_PAGE, coursesPage * ITEMS_PER_PAGE);

                      return (
                        <>
                          {paginated.map((course, index) => {
                            const id = course.courseId;
                            const isEditing = editingCourse && (
                              (id !== undefined && (editingCourse.courseId === id))
                            );
                            return (
                              <TableRow key={id || `course-${index}`} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100/60">
                                <TableCell className="py-4 px-6">
                                  {isEditing ? (
                                    <Input
                                      className="rounded-lg border-slate-200 font-semibold text-sm"
                                      value={editingCourse.name}
                                      onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                                    />
                                  ) : (
                                    <span className="font-bold text-slate-900 font-poppins text-sm">{course.name}</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right space-x-1">
                                  {isEditing ? (
                                    <>
                                      <Button size="icon" variant="ghost" onClick={handleUpdateCourse} className="hover:bg-green-50 rounded-full h-9 w-9">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button size="icon" variant="ghost" onClick={() => setEditingCourse(null)} className="hover:bg-red-50 rounded-full h-9 w-9">
                                        <X className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button size="icon" variant="ghost" onClick={() => setEditingCourse(course)} className="hover:bg-logo-blue/10 rounded-full h-9 w-9 group-hover:bg-logo-blue/10">
                                        <Pencil className="h-4 w-4 text-logo-blue" />
                                      </Button>
                                      <Button size="icon" variant="ghost" onClick={() => handleDeleteCourse(String(course.courseId))} className="hover:bg-red-50 rounded-full h-9 w-9 group-hover:bg-red-50">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {filtered.length > 0 && (
                            <TableRow>
                              <TableCell colSpan={2} className="py-4 px-6">
                                <div className="flex items-center justify-between">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCoursesPage(p => Math.max(1, p - 1))}
                                    disabled={coursesPage === 1}
                                    className="rounded-lg h-8 px-4 font-bold text-xs shadow-sm border-logo-blue/20 hover:bg-logo-blue hover:text-white text-logo-blue transition-all duration-300"
                                  >
                                    Previous
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCoursesPage(p => Math.min(totalPages, p + 1))}
                                    disabled={coursesPage === totalPages}
                                    className="rounded-lg h-8 px-4 font-bold text-xs shadow-sm border-logo-gold/20 hover:bg-logo-gold hover:text-white text-logo-gold transition-all duration-300"
                                  >
                                    Next
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })()}
                    {courses.length === 0 && (
                      <TableRow key="no-courses">
                        <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">No courses found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiter-eye" className="animate-in fade-in slide-in-from-right-4 duration-500">
          <Card className="border border-logo-gold/20 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-logo-gold/5 to-transparent pb-6 border-b border-logo-gold/10 px-6 sm:px-8">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 font-poppins flex items-center gap-3">
                  <Users className="h-5 w-5 text-logo-gold" />
                </CardTitle>
              </div>
              <Dialog open={isRecruiterEyeDialogOpen} onOpenChange={setIsRecruiterEyeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-logo-gold text-white hover:bg-logo-gold/90 font-semibold rounded-lg shadow-sm transition-all h-auto py-2.5 px-6 font-poppins">
                    <Plus className="h-4 w-4 mr-2" />
                    New Recruiter Eye
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-xl border-slate-200 font-poppins">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 font-poppins">Add New Recruiter Eye</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 font-poppins">
                    <div className="grid gap-2 font-poppins">
                      <Label htmlFor="re-name" className="text-logo-blue font-semibold font-poppins">Name</Label>
                      <Input
                        id="re-name"
                        value={newRecruiterEye.name}
                        onChange={(e) => setNewRecruiterEye({ ...newRecruiterEye, name: e.target.value })}
                        className="border-slate-200 focus:border-logo-blue focus:ring-logo-blue/20 rounded-xl font-poppins"
                        placeholder="e.g. Technical Skills Assessment"
                      />
                    </div>
                    <div className="grid gap-2 font-poppins">
                      <Label htmlFor="re-overview" className="text-logo-blue font-semibold font-poppins">Overview</Label>
                      <Input
                        id="re-overview"
                        value={newRecruiterEye.overview}
                        onChange={(e) => setNewRecruiterEye({ ...newRecruiterEye, overview: e.target.value })}
                        className="border-slate-200 focus:border-logo-blue focus:ring-logo-blue/20 rounded-xl font-poppins"
                        placeholder="e.g. Assessment tool for evaluating technical skills"
                      />
                    </div>
                  </div>
                  <DialogFooter className="font-poppins">
                    <Button onClick={handleCreateRecruiterEye} className="bg-logo-gold text-white hover:bg-logo-gold/90 font-semibold rounded-lg font-poppins">Create Recruiter Eye</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto w-full">
                <Table className="border-collapse font-poppins w-full">
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 font-poppins">Name</TableHead>
                      <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 font-poppins">Overview</TableHead>
                      <TableHead className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right font-poppins">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filtered = recruiterEyes.filter(Boolean);

                      return (
                        <>
                          {filtered.map((recruiterEye, index) => {
                            const id = recruiterEye.recruiterEyeId || recruiterEye.id;
                            const isEditing = editingRecruiterEye && (
                              (id !== undefined && ((editingRecruiterEye.recruiterEyeId || editingRecruiterEye.id) === id))
                            );
                            return (
                              <TableRow key={id || `re-${index}`} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100/60">
                                <TableCell className="py-4 px-6">
                                  {isEditing ? (
                                    <Input
                                      className="rounded-lg border-slate-200 font-semibold text-sm"
                                      value={editingRecruiterEye.name}
                                      onChange={(e) => setEditingRecruiterEye({ ...editingRecruiterEye, name: e.target.value })}
                                    />
                                  ) : (
                                    <span className="font-bold text-slate-900 font-poppins text-sm">{recruiterEye.name}</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-4 px-6 align-top min-w-[600px]">
                                  {isEditing ? (
                                    <Input
                                      className="rounded-lg border-slate-200 font-semibold text-sm"
                                      value={editingRecruiterEye.overview}
                                      onChange={(e) => setEditingRecruiterEye({ ...editingRecruiterEye, overview: e.target.value })}
                                    />
                                  ) : (
                                    <RecruiterOverviewContent overview={recruiterEye.overview} />
                                  )}
                                </TableCell>
                                <TableCell className="py-4 px-6 text-right space-x-1 align-top whitespace-nowrap">
                                  {isEditing ? (
                                    <>
                                      <Button size="icon" variant="ghost" onClick={handleUpdateRecruiterEye} className="hover:bg-green-50 rounded-full h-9 w-9">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button size="icon" variant="ghost" onClick={() => setEditingRecruiterEye(null)} className="hover:bg-red-50 rounded-full h-9 w-9">
                                        <X className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button size="icon" variant="ghost" onClick={() => setEditingRecruiterEye(recruiterEye)} className="hover:bg-logo-blue/10 rounded-full h-9 w-9 group-hover:bg-logo-blue/10">
                                        <Pencil className="h-4 w-4 text-logo-blue" />
                                      </Button>
                                      <Button size="icon" variant="ghost" onClick={() => handleDeleteRecruiterEye(recruiterEye)} className="hover:bg-red-50 rounded-full h-9 w-9 group-hover:bg-red-50">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {filtered.length > 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="py-4 px-6">
                                <div className="flex items-center justify-between">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRecruiterEyesPage(p => Math.max(1, p - 1))}
                                    disabled={recruiterEyesPage === 1}
                                    className="rounded-lg h-8 px-4 font-bold text-xs shadow-sm border-logo-blue/20 hover:bg-logo-blue hover:text-white text-logo-blue transition-all duration-300"
                                  >
                                    Previous
                                  </Button>
                                  <span className="text-xs font-bold text-slate-500">Page {recruiterEyesPage}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRecruiterEyesPage(p => p + 1)}
                                    disabled={filtered.length < ITEMS_PER_PAGE}
                                    className="rounded-lg h-8 px-4 font-bold text-xs shadow-sm border-logo-gold/20 hover:bg-logo-gold hover:text-white text-logo-gold transition-all duration-300"
                                  >
                                    Next
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })()}
                    {recruiterEyes.length === 0 && (
                      <TableRow key="no-recruiter-eyes">
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No Recruiter Eyes found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unique-codes" className="animate-in fade-in slide-in-from-right-4 duration-500">
          <Card className="border border-logo-blue/20 shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-logo-blue/5 to-transparent pb-6 border-b border-logo-blue/10 px-6 sm:px-8">
              <CardTitle className="text-base font-bold text-slate-900 font-poppins flex items-center gap-3">
                <Key className="h-5 w-5 text-logo-blue" />
                Generate Unique Codes
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2 text-sm">
                Generate batch unique codes for talent verification
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 py-8">
              <div className="space-y-6">
                {/* Code Generation Form */}
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="codes-count" className="text-logo-gold font-semibold font-poppins">
                      Number of Codes to Generate
                    </Label>
                    <Input
                      id="codes-count"
                      type="number"
                      min="1"
                      max="1000"
                      value={uniqueCodesCount}
                      onChange={(e) => setUniqueCodesCount(parseInt(e.target.value) || 0)}
                      className="border-slate-200 focus:border-logo-gold focus:ring-logo-gold/20 rounded-xl font-poppins"
                      placeholder="Enter number of codes (e.g., 10)"
                    />
                    <p className="text-xs text-slate-500 font-poppins">Enter a number between 1 and 1,000</p>
                  </div>

                  <Button
                    onClick={handleGenerateUniqueCodes}
                    disabled={isGeneratingCodes || uniqueCodesCount <= 0}
                    className="bg-logo-blue text-white hover:bg-logo-blue/90 font-semibold rounded-lg shadow-sm transition-all font-poppins w-full"
                  >
                    {isGeneratingCodes ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Generate {uniqueCodesCount} Codes
                      </>
                    )}
                  </Button>
                </div>

                {/* Generated Codes Display */}
                {generatedCodes.length > 0 && (
                  <div className="space-y-4 border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 font-poppins">
                        Generated Codes ({generatedCodes.length})
                      </h3>
                      <Button
                        onClick={() => {
                          const codesText = generatedCodes.join('\n');
                          navigator.clipboard.writeText(codesText);
                          toast.success("Codes copied to clipboard");
                        }}
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-logo-gold/20 text-logo-gold hover:bg-logo-gold hover:text-white transition-all"
                      >
                        Copy All
                      </Button>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                      <div className="grid gap-2">
                        {generatedCodes.map((code, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between group hover:border-logo-gold/30 transition-colors"
                          >
                            <code className="text-sm font-mono text-slate-700 font-poppins break-all">
                              {code}
                            </code>
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(code);
                                toast.success("Code copied");
                              }}
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg h-8 w-8 p-0"
                            >
                              📋
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 font-poppins">
                        ✓ Successfully generated {generatedCodes.length} unique codes. Each code can be used once for talent verification.
                      </p>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {generatedCodes.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <Key className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-poppins">
                      No codes generated yet. Enter a number above and click "Generate Codes" to create unique codes.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blogs" className="animate-in fade-in slide-in-from-right-4 duration-500">
          <BlogManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper components for the edit mode
const CheckCircle = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default AdminDashboard;
