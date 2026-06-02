import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiFetch, apiUrl, isAuthExpired } from "@/lib/api";
import { Briefcase, PlusCircle, Users, Rocket, Calendar, BookOpen, Target, FileText, Link as LinkIcon, Upload, CheckCircle2, Loader2, Share2, Lightbulb, Clock, Eye, X, Copy } from "lucide-react";
import BackButton from "@/components/BackButton";

const EXTERNAL_LINK_MIME_TYPE = "text/uri-list";

const normalizeApiValue = (value: any) => {
  if (value === null || value === undefined) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const lower = trimmed.toLowerCase();
    if (lower === "null" || lower === "undefined") return null;

    return trimmed;
  }

  return value;
};

const normalizeExternalUrl = (value: any) => {
  const url = normalizeApiValue(value);
  if (typeof url !== "string") return null;

  if (/^[a-z][a-z\d+\-.]*:/i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.includes(".") || url.includes("/")) return `https://${url}`;

  return url;
};

const getProjectValue = (project: any, keys: string[]) => {
  for (const key of keys) {
    const value = normalizeApiValue(project?.[key]);
    if (value !== null) return value;
  }

  return null;
};

const buildExternalLinkEvidence = (linkValue: any) => {
  const link = normalizeApiValue(linkValue);
  if (typeof link !== "string") return null;

  try {
    const parsedUrl = new URL(link);
    const host = parsedUrl.hostname.replace(/^www\./i, "");
    const label = host ? `${host} link` : "External evidence link";

    return {
      fileUrl: link,
      fileName: label,
      storedFileName: label,
      mimeType: EXTERNAL_LINK_MIME_TYPE,
      isExternalEvidenceLink: true,
    };
  } catch {
    return {
      fileUrl: link,
      fileName: "External evidence link",
      storedFileName: "External evidence link",
      mimeType: EXTERNAL_LINK_MIME_TYPE,
      isExternalEvidenceLink: true,
    };
  }
};

const getProjectEvidenceDetails = (project: any) => {
  const link = getProjectValue(project, ["link", "Link"]);
  const fileUrl = getProjectValue(project, ["fileUrl", "FileUrl"]);
  const fileName = getProjectValue(project, ["fileName", "FileName"]);
  const storedFileName = getProjectValue(project, ["storedFileName", "StoredFileName"]);
  const mimeType = getProjectValue(project, ["mimeType", "MimeType"]);
  const derivedEvidence = !fileUrl && link ? buildExternalLinkEvidence(link) : null;

  return {
    link,
    fileUrl: fileUrl || derivedEvidence?.fileUrl || null,
    fileName: fileName || derivedEvidence?.fileName || null,
    storedFileName: storedFileName || fileName || derivedEvidence?.storedFileName || null,
    mimeType: mimeType || derivedEvidence?.mimeType || null,
    isExternalEvidenceLink: derivedEvidence?.isExternalEvidenceLink === true,
  };
};

const extractApiErrorMessage = (body: any, rawText: string) => {
  const candidates = [
    body?.message,
    body?.error,
    body?.title,
    body?.detail,
    body?.data?.message,
    body?.data?.error,
    rawText,
  ];

  for (const candidate of candidates) {
    const value = normalizeApiValue(candidate);
    if (typeof value === "string" && value) return value;
  }

  return "";
};

const getProjectCreateErrorMessage = (status: number, message: string) => {
  const lower = message.toLowerCase();

  if (status === 401 || status === 403) {
    return "Your session has expired. Please sign in again and try once more.";
  }

  if (status === 413 || lower.includes("too large") || lower.includes("file size") || lower.includes("payload too large")) {
    return "Your file is too large. Please upload a smaller PDF, JPG, or PNG file.";
  }

  if (status === 400 || status === 422) {
    if (lower.includes("link") || lower.includes("url")) {
      return "The project link looks invalid. Please enter a complete web address starting with http:// or https://.";
    }

    if (lower.includes("file")) {
      return "The uploaded file could not be accepted. Please try a PDF, JPG, or PNG file under 5MB.";
    }

    return message || "Some of the project details are invalid. Please check the form and try again.";
  }

  if (status === 429) {
    return "Too many requests were sent. Please wait a moment and try again.";
  }

  if (status >= 500) {
    return "The server had a problem saving your project. Please try again in a moment.";
  }

  if (lower.includes("network") || lower.includes("fetch")) {
    return "We could not reach the server. Please check your connection and try again.";
  }

  if (message) return message;
  return "An error occurred while creating the project.";
};

const CountdownTimer = ({ questionServedAt, maxTimeSeconds, onTimeUp }: { questionServedAt: string | number, maxTimeSeconds: number, onTimeUp?: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!questionServedAt || !maxTimeSeconds) return 0;
      const servedAtTime = new Date(questionServedAt).getTime();
      if (isNaN(servedAtTime)) return 0;

      const now = new Date().getTime();
      const diff = Math.floor((now - servedAtTime) / 1000);
      const remaining = Math.max(0, Number(maxTimeSeconds) - diff);
      return remaining;
    };

    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);
    if (initialTime <= 0 && onTimeUp) {
      onTimeUp();
    }

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        if (onTimeUp) onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [questionServedAt, maxTimeSeconds, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (isNaN(timeLeft) || timeLeft === undefined || timeLeft === null) return null;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all ${timeLeft < 30 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-logo-blue/5 border-logo-blue/20 text-logo-blue'}`}>
      <Clock className={`h-4 w-4 ${timeLeft < 30 ? 'text-red-600' : 'text-logo-blue'}`} />
      <span className="font-semibold font-poppins text-sm tabular-nums">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

const Projects = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    goal: "",
    link: "",
    acceptedTerms: false,
    courseId: "",
    verificationText: "",
  });
  const [showVerification, setShowVerification] = useState(false);
  const [interviewSession, setInterviewSession] = useState<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const normalizeInterviewData = (data: any) => {
    if (!data) return null;

    // Helper to extract value with multiple possible keys, handling 0 and false correctly
    const getVal = (obj: any, keys: string[]) => {
      for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];
      }
      return undefined;
    };

    const normalized = {
      interviewSessionId: getVal(data, ["interviewSessionId", "InterviewSessionId"]),
      projectId: Number(getVal(data, ["projectId", "ProjectId"]) ?? 0) || null,
      currentQuestion: getVal(data, ["currentQuestion", "CurrentQuestion", "question", "Question"]),
      currentPillar: getVal(data, ["currentPillar", "CurrentPillar", "pillar", "Pillar"]),
      questionIndex: Number(getVal(data, ["questionIndex", "QuestionIndex"]) ?? 0),
      isCompleted: getVal(data, ["isCompleted", "IsCompleted"]) === true || getVal(data, ["isCompleted", "IsCompleted"]) === "true",
      questionServedAt: getVal(data, ["questionServedAt", "QuestionServedAt"]),
      maxTimeSeconds: Number(getVal(data, ["maxTimeSeconds", "MaxTimeSeconds"]) || 0),
    };
    console.log("Normalized Interview Data:", normalized);
    return normalized;
  };

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedProject, setSubmittedProject] = useState<any>(null);
  const [isLoadingSubmitted, setIsLoadingSubmitted] = useState(false);
  const [viewingFile, setViewingFile] = useState<{url: string, name: string, type: string, projectId: number} | null>(null);
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [courses, setCourses] = useState<{ courseId: number; name: string }[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectLoadError, setProjectLoadError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState<"selectProject" | "selectPath" | "interview">("selectProject");

  // Fetch file when viewingFile changes with AbortController for optimization
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    if (viewingFile) {
      setFileBlob(null);
      setFileBlobUrl(null);
      const loadFile = async () => {
        setIsLoadingFile(true);
        try {
          const startTime = performance.now();
          const res = await apiFetch(viewingFile.url, {
            signal: abortController.signal,
          } as RequestInit);

          if (res.ok && isMounted) {
            const blob = await res.blob();
            setFileBlob(blob);
            const fetchTime = performance.now() - startTime;
            console.log(`✓ File fetched in ${fetchTime.toFixed(0)}ms:`, viewingFile.name, `(${(blob.size / 1024).toFixed(1)}KB)`);
          } else {
            toast({
              title: "Error loading file",
              description: "Could not fetch the file",
              variant: "destructive",
            });
            setViewingFile(null);
          }
        } catch (e) {
          if ((e as any)?.name === 'AbortError') {
            console.log("File fetch cancelled");
            return;
          }
          console.error("Error fetching file:", e);
          toast({
            title: "Error loading file",
            description: String(e),
            variant: "destructive",
          });
          setViewingFile(null);
        } finally {
          if (isMounted) {
            setIsLoadingFile(false);
          }
        }
      };
      loadFile();
    }

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [viewingFile]);

  // Create blob URL when blob is ready
  useEffect(() => {
    if (fileBlob) {
      const url = URL.createObjectURL(fileBlob);
      setFileBlobUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [fileBlob]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiFetch("/api/courses/get-courses");
        if (response.ok) {
          const data = await response.json();
          const coursesList = Array.isArray(data) ? data : data.data || [];
          setCourses(coursesList);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();

    // Check for active interview session
    const savedSessionId = localStorage.getItem("active_interview_session_id");
    if (savedSessionId) {
      resumeInterview(savedSessionId);
    }
  }, []);

  useEffect(() => {
    setIsTimeUp(false);
  }, [interviewSession?.questionIndex, interviewSession?.questionServedAt]);

  const handleTimeUp = useCallback(() => {
    setIsTimeUp(true);
  }, []);

  const fetchPortfolioProjects = async (showErrorToast: boolean = true) => {
    setLoadingProjects(true);
    setProjectLoadError(null);
    try {
      const response = await apiFetch("/api/projects/get-projects");
      if (response.ok) {
        const data = await response.json();
        // Handle both array and object with data property
        const projects = Array.isArray(data) ? data : (data.data || data.projects || []);
        setPortfolioProjects(projects);
        setProjectLoadError(null);
        if (projects.length > 0) {
          setSelectedProjectId(projects[0].projectId || projects[0].id);
        }
      } else if (isAuthExpired(response)) {
        const errorMsg = "Your session has expired. Please log in again to continue.";
        setProjectLoadError(errorMsg);
        if (showErrorToast) {
          toast({
            title: "Session expired",
            description: errorMsg,
            variant: "destructive",
          });
        }
      } else {
        const errorMsg = "We're having trouble loading your projects. Please refresh the page or try again later.";
        setProjectLoadError(errorMsg);
        if (showErrorToast) {
          toast({
            title: "Unable to load projects",
            description: errorMsg,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      const errorMsg = "We're having trouble loading your projects. Please refresh the page or try again later.";
      setProjectLoadError(errorMsg);
      if (showErrorToast) {
        toast({
          title: "Unable to load projects",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } finally {
      setLoadingProjects(false);
    }
  };

  const resumeInterview = async (sessionId: string) => {
    setIsInterviewLoading(true);
    try {
      const response = await apiFetch(`/api/interviews/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        const normalized = normalizeInterviewData(data);

        // Restore the original questionServedAt from localStorage if available
        // This prevents the timer from resetting on page refresh
        const savedQuestionServedAt = localStorage.getItem(`interview_question_served_at_${sessionId}`);
        if (savedQuestionServedAt) {
          normalized.questionServedAt = savedQuestionServedAt;
          console.log("Restored original questionServedAt from localStorage:", savedQuestionServedAt);
        } else if (normalized?.questionServedAt) {
          // Save it for next time
          localStorage.setItem(`interview_question_served_at_${sessionId}`, normalized.questionServedAt);
        }

        setInterviewSession(normalized);
        if (normalized?.projectId) {
          setSelectedProjectId(normalized.projectId);
        }
        // Don't set showVerification here - keep the UI showing "Get Started" by default
        // The interview will be shown in background if active
      } else {
        localStorage.removeItem("active_interview_session_id");
      }
    } catch (error) {
      console.error("Error resuming interview:", error);
    } finally {
      setIsInterviewLoading(false);
    }
  };

  const startInterview = async (path: { value: string; title: string; description: string }) => {
    setFormData(prev => ({ ...prev, verificationText: path.value }));
    setIsInterviewLoading(true);
    try {
      const response = await apiFetch("/api/interviews/start", {
        method: "POST",
        body: JSON.stringify({
          ProjectId: selectedProjectId,
          SelectedPath: path.value,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = normalizeInterviewData(data);
        setInterviewSession(normalized);
        if (normalized?.interviewSessionId) {
          localStorage.setItem("active_interview_session_id", normalized.interviewSessionId);
          // Save the original questionServedAt to preserve timer on refresh
          if (normalized?.questionServedAt) {
            localStorage.setItem(`interview_question_served_at_${normalized.interviewSessionId}`, normalized.questionServedAt);
          }
        }
      } else {
        toast({
          title: "Failed to start interview",
          description: "An error occurred while starting the interview session.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error starting interview:", error);
    } finally {
      setIsInterviewLoading(false);
    }
  };

  const submitInterviewAnswer = async () => {
    if ((!currentAnswer.trim() && !isTimeUp) || !interviewSession) return;
    setIsInterviewLoading(true);
    try {
      const response = await apiFetch("/api/interviews/answer", {
        method: "POST",
        body: JSON.stringify({
          InterviewSessionId: interviewSession.interviewSessionId,
          Answer: currentAnswer.trim() || (isTimeUp ? "No response" : ""),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = normalizeInterviewData(data);

        // Save the original questionServedAt for the new question
        if (normalized?.questionServedAt && interviewSession?.interviewSessionId) {
          localStorage.setItem(`interview_question_served_at_${interviewSession.interviewSessionId}`, normalized.questionServedAt);
        }

        setInterviewSession(normalized);
        if (normalized?.projectId) {
          setSelectedProjectId(normalized.projectId);
        }
        setCurrentAnswer("");
        if (normalized?.isCompleted) {
          localStorage.removeItem("active_interview_session_id");
          // Clean up question timestamp on completion
          if (interviewSession?.interviewSessionId) {
            localStorage.removeItem(`interview_question_served_at_${interviewSession.interviewSessionId}`);
          }

          const completedProjectId = normalized?.projectId ?? interviewSession?.projectId ?? selectedProjectId;
          if (completedProjectId) {
            navigate(`/forensic-app/portfolio?tab=projects&project=${completedProjectId}`);
          }
        }
      } else {
        toast({
          title: "Failed to submit answer",
          description: "An error occurred while submitting your response.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsInterviewLoading(false);
    }
  };

  const getReportProjectId = () => Number(interviewSession?.projectId ?? selectedProjectId ?? 0) || null;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "create") {
      setActiveTab("create");
    }
  }, [searchParams]);

  // Validation logic
  useEffect(() => {
    const { acceptedTerms, link, name, duration, goal, verificationText } = formData;
    const hasFileOrLink = (file !== null) || (link.trim() !== "");
    const hasRequiredFields = name.trim() !== "" && duration.trim() !== "" && goal.trim() !== "" && formData.courseId !== "";
    // Submit is enabled if basic fields are present
    setIsSubmitDisabled(!(acceptedTerms && hasFileOrLink && hasRequiredFields));
  }, [formData, file]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    // Map UI IDs to form data keys
    const keyMap: Record<string, string> = {
      "project-name": "name",
      "duration": "duration",
      "goal": "goal",
      "project-link": "link",
    };
    const key = keyMap[id];
    if (key) {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Extension validation
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Allowed extensions are .jpg, .jpeg, .png, .pdf",
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
      return;
    }

    // Size validation (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (isSubmitDisabled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("Name", formData.name);
      submitData.append("Duration", formData.duration);
      submitData.append("Goal", formData.goal);
      if (formData.verificationText) {
        submitData.append("VerificationText", formData.verificationText);
      }
      submitData.append("AcceptedTerms", String(formData.acceptedTerms));

      if (formData.courseId) {
        submitData.append("CourseId", formData.courseId);
      }

      const normalizedLink = normalizeExternalUrl(formData.link);
      if (normalizedLink) {
        submitData.append("Link", normalizedLink);
      }
      if (file) {
        submitData.append("File", file);
      }

      const response = await apiFetch("/api/projects", {
        method: "POST",
        body: submitData,
        // Don't set Content-Type header when using FormData so the browser sets it with boundary
      });

      const responseText = await response.text().catch(() => "");
      let responseData: any = {};
      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { message: responseText };
        }
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project started successfully, capture your thought process and get a shareable link for recruiters",
        });

        // Get the new project ID if returned by the API
        const newProjectId = responseData.id || responseData.projectId || responseData.data?.id || responseData.data?.projectId || responseData.ProjectId;

        // Reset form
        setFormData({
          name: "",
          duration: "",
          goal: "",
          link: "",
          acceptedTerms: false,
          courseId: "",
          verificationText: "",
        });
        setShowVerification(false);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        // If we have an ID, fetch the project details and show them
        if (newProjectId) {
          try {
            setIsLoadingSubmitted(true);
            const projectRes = await apiFetch(`/api/projects/${newProjectId}`);
            if (projectRes.ok) {
              const projectData = await projectRes.json();
              setSubmittedProject(projectData);
            } else if (isAuthExpired(projectRes)) {
              toast({
                title: "Session expired",
                description: "Your session has expired. Please log in again to continue.",
                variant: "destructive",
              });
              setActiveTab("assigned");
            } else {
              setActiveTab("assigned");
            }
          } catch (error) {
            console.error("Error fetching new project:", error);
            setActiveTab("assigned");
          } finally {
            setIsLoadingSubmitted(false);
          }
        } else {
          setActiveTab("assigned");
        }
      } else {
        const errorMessage = getProjectCreateErrorMessage(response.status, extractApiErrorMessage(responseData, responseText));
        toast({
          title: "Failed to start project",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Error",
        description: "We could not reach the server. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submittedProjectEvidence = submittedProject ? getProjectEvidenceDetails(submittedProject) : null;

  const handleCopyValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      });
    } catch (error) {
      console.error(`Error copying ${label.toLowerCase()}:`, error);
      toast({
        title: "Unable to copy",
        description: "Please select the text and copy it manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-0 -mt-2 sm:-mt-6 overflow-x-hidden w-full">
      {/* Header Area */}
      <div className="bg-slate-50/50 border-b border-slate-100 rounded-3xl p-4 sm:p-8 mb-6 relative">
        <div className="absolute top-2 left-2 sm:top-6 sm:left-6">
          <BackButton fallbackPath="/forensic-app" />
        </div>
        <div className="flex flex-col items-center text-center pt-8 sm:pt-0">
          <div className="mb-2 font-poppins">
            <span className="text-[10px] sm:text-xs font-black text-logo-gold uppercase tracking-widest font-poppins">Workbench</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-normal tracking-tight text-slate-600 font-poppins">Projects</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs List Area - Responsive layout */}
          <div className="w-full -mt-10 relative z-10 px-2 sm:px-0">
            <TabsList className="flex flex-col sm:flex-row w-full bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl p-1.5 h-auto gap-1.5">
              <TabsTrigger
                value="create"
                className="w-full sm:flex-1 justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold data-[state=active]:bg-amber-400 data-[state=active]:text-slate-900 rounded-xl transition-all"
              >
                <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Create new project
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Area */}
          <div className="py-4 sm:py-6">
            <TabsContent value="create" className="mt-0 animate-in slide-in-from-right-4 fade-in duration-500 outline-none">
              <div className="w-full mx-auto">
                <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden border-t-8 border-t-logo-gold transition-all duration-300 hover:shadow-slate-300/60">
                  <CardHeader className="text-center pb-1 pt-3 sm:pt-5 bg-gradient-to-b from-logo-gold/10 to-transparent font-poppins px-6">
                    <CardTitle className="text-base sm:text-lg font-semibold text-slate-700 tracking-tight font-poppins">
                      {submittedProject ? "Start the journey of proving your ability." : "Start the journey of proving your ability."}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-600 mt-1 font-poppins max-w-lg mx-auto leading-relaxed font-medium">
                      {!submittedProject && "Set your project goals, build your project using AI or other tools, upload your evidence, and show recruiters your real capability."}
                    </CardDescription>
                    <p className="text-xs sm:text-sm text-slate-500 font-poppins mt-3">
                      Not sure about what project to do and upload? Visit the {" "}
                      <Link to="/forensic-app?recruiterEye=true" className="font-semibold text-logo-blue hover:text-logo-gold hover:underline transition-colors">
                        Recruiter's Eye
                      </Link>
                      .
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                      {/* Left Side: Project Form OR Details */}
                      <div className="space-y-4 sm:space-y-5">
                        {isLoadingSubmitted ? (
                          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 shadow-xl">
                            <Loader2 className="h-10 w-10 animate-spin text-logo-blue mb-4" />
                            <p className="text-slate-500 font-semibold font-poppins">Loading project details...</p>
                          </div>
                        ) : submittedProject ? (
                          <div className="space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="font-poppins text-[14px] mb-3 text-slate-300">{'{'}</div>
                            <div className="space-y-2.5 font-poppins pl-6">
                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-[13px] font-bold text-logo-blue/60 tracking-tight">"name":</span>
                                <span className="text-[13px] text-slate-900 font-black">"{submittedProject.name || submittedProject.Name || "null"}",</span>
                              </div>

                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-[13px] font-bold text-logo-blue/60 tracking-tight">"duration":</span>
                                <span className="text-[13px] text-slate-800 font-bold">"{submittedProject.duration || submittedProject.Duration || "null"}",</span>
                              </div>

                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-[13px] font-bold text-logo-blue/60 tracking-tight">"goal":</span>
                                <span className="text-[13px] text-slate-700 font-semibold leading-relaxed">"{submittedProject.goal || submittedProject.Goal || "null"}",</span>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-1">
                                <span className="text-[13px] font-bold text-logo-blue/60 tracking-tight sm:shrink-0">"link":</span>
                                {submittedProjectEvidence?.link ? (
                                  <div className="flex items-center gap-2 min-w-0 w-full">
                                    <input
                                      readOnly
                                      value={submittedProjectEvidence.link}
                                      onFocus={(e) => e.currentTarget.select()}
                                      onClick={(e) => e.currentTarget.select()}
                                      className="w-full bg-transparent text-[13px] text-logo-blue font-black break-all outline-none cursor-text px-0 py-0 border-0 focus:ring-0"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => void handleCopyValue(submittedProjectEvidence.link, "Link")}
                                      className="h-8 w-8 p-0 text-logo-blue hover:text-logo-gold hover:bg-logo-gold/5 shrink-0"
                                      title="Copy link"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-[13px] text-slate-300 font-medium italic">"Not provided",</span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-[13px] font-bold text-logo-blue/60 tracking-tight">"storedFileName":</span>
                                <span className="text-[13px] text-slate-400 font-medium">"{submittedProjectEvidence?.storedFileName || "Not provided"}",</span>
                              </div>

                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-[13px] font-bold text-logo-blue/60 tracking-tight">"fileName":</span>
                                <span className="text-[13px] text-slate-400 font-medium">"{submittedProjectEvidence?.fileName || "Not provided"}",</span>
                              </div>

                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-[13px] font-bold text-logo-blue/60 tracking-tight">"mimeType":</span>
                                <span className="text-[13px] text-slate-400 font-medium">"{submittedProjectEvidence?.mimeType || "Not provided"}",</span>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-1">
                                <span className="text-[13px] font-bold text-logo-blue/60 tracking-tight sm:shrink-0">"fileUrl":</span>
                                {submittedProjectEvidence?.fileUrl ? (
                                  <div className="flex items-center gap-2 min-w-0 w-full">
                                    {submittedProjectEvidence.isExternalEvidenceLink ? (
                                      <input
                                        readOnly
                                        value={submittedProjectEvidence.fileUrl}
                                        onFocus={(e) => e.currentTarget.select()}
                                        onClick={(e) => e.currentTarget.select()}
                                        className="w-full bg-transparent text-[13px] text-logo-gold font-black break-all outline-none cursor-text px-0 py-0 border-0 focus:ring-0"
                                      />
                                    ) : (
                                      <button
                                        onClick={() => {
                                          const id = submittedProject.id || submittedProject.projectId || submittedProject.ProjectId;
                                          if (viewingFile?.projectId === id) {
                                            setViewingFile(null);
                                          } else {
                                            const isPdf = submittedProjectEvidence.fileUrl.toLowerCase().endsWith('.pdf') || (submittedProjectEvidence.mimeType && submittedProjectEvidence.mimeType.toLowerCase().includes('pdf')) || (submittedProjectEvidence.storedFileName && submittedProjectEvidence.storedFileName.toLowerCase().endsWith('.pdf'));
                                            setViewingFile({
                                              projectId: id,
                                              url: submittedProjectEvidence.fileUrl,
                                              name: submittedProjectEvidence.fileName || "Project Document",
                                              type: submittedProjectEvidence.mimeType || (isPdf ? 'application/pdf' : 'image/jpeg')
                                            });
                                          }
                                        }}
                                        className="min-w-0 w-full text-[13px] text-left text-logo-gold hover:text-logo-gold/80 hover:underline font-black transition-colors break-all"
                                      >
                                        <span className="block text-left break-all">{submittedProjectEvidence.fileUrl}</span>
                                      </button>
                                    )}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => void handleCopyValue(submittedProjectEvidence.fileUrl, "File URL")}
                                      className="h-8 w-8 p-0 text-logo-gold hover:text-logo-gold/80 hover:bg-logo-gold/5 shrink-0"
                                      title="Copy file URL"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-[13px] text-slate-300 font-medium italic">"Not provided"</span>
                                )}
                              </div>
                            </div>
                            <div className="font-poppins text-[14px] mt-3 text-slate-300">{'}'}</div>

                            {/* Inline Document/Image Viewer */}
                            {viewingFile && viewingFile.projectId === (submittedProject.id || submittedProject.projectId || submittedProject.ProjectId) && (
                              <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                                  {/* File Name */}
                                  <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <FileText className="h-5 w-5 text-logo-gold flex-shrink-0" />
                                    <span className="text-sm font-black text-slate-900 truncate max-w-[200px] sm:max-w-[400px]">
                                      {viewingFile.name}
                                    </span>
                                  </div>

                                  {/* Close Button */}
                                  <div className="flex items-center gap-3 ml-auto sm:ml-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setViewingFile(null);
                                      }}
                                      className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 transition-colors"
                                    >
                                      <X className="h-5 w-5 text-slate-500" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="w-full">
                                  {/* Document/Image Viewer */}
                                  <div className="space-y-4">
                                    <div className="w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-100 min-h-[400px] flex items-center justify-center relative shadow-sm">
                                      {isLoadingFile ? (
                                        <div className="flex flex-col items-center gap-4 py-20">
                                          <div className="w-8 h-8 border-3 border-logo-gold border-t-transparent rounded-full animate-spin"></div>
                                          <p className="text-slate-500 font-bold text-xs animate-pulse">Loading file...</p>
                                        </div>
                                      ) : fileBlobUrl && fileBlob ? (
                                        (() => {
                                          const mimeType = fileBlob.type || "";
                                          const isPdf = mimeType === "application/pdf";

                                          if (isPdf) {
                                            return (
                                              <iframe
                                                src={fileBlobUrl}
                                                title={viewingFile?.name}
                                                className="w-full h-full min-h-[400px] border-0 rounded-lg"
                                              />
                                            );
                                          } else if (mimeType.startsWith("image/")) {
                                            return (
                                              <div className="w-full flex items-center justify-center p-4">
                                                <img
                                                  src={fileBlobUrl}
                                                  alt={viewingFile?.name}
                                                  className="w-full h-auto max-h-[75vh] object-contain shadow-md rounded-lg transition-all duration-500"
                                                />
                                              </div>
                                            );
                                          }
                                          return (
                                            <div className="text-center p-12">
                                              <FileText className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                                              <p className="text-slate-500 font-bold text-sm">Unsupported file type: {mimeType}</p>
                                            </div>
                                          );
                                        })()
                                      ) : viewingFile ? (
                                        <div className="text-center p-12">
                                          <FileText className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                                          <p className="text-slate-500 font-bold text-sm">Error loading file</p>
                                        </div>
                                      ) : (
                                        <div className="text-center p-12">
                                          <FileText className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                                          <p className="text-slate-500 font-bold text-sm">No file selected</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 sm:space-y-5">
                            <div className="space-y-4">
                              <div className="space-y-1.5 group">
                                <Label htmlFor="project-name" className="text-sm font-medium text-slate-600 font-poppins group-focus-within:text-logo-gold transition-colors">
                                  Project Name
                                </Label>
                                <Input
                                  id="project-name"
                                  placeholder="e.g. Market Entry Analysis"
                                  className="font-poppins font-medium focus-visible:ring-logo-gold/20 focus-visible:border-logo-gold/50 transition-all"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>

                              <div className="space-y-1.5 group">
                                <Label htmlFor="project-course" className="text-sm font-medium text-slate-600 font-poppins group-focus-within:text-logo-gold transition-colors">
                                  Assign course
                                </Label>
                                <Select
                                  value={formData.courseId}
                                  onValueChange={(val) => setFormData(prev => ({ ...prev, courseId: val }))}
                                >
                                  <SelectTrigger id="project-course" className="font-poppins font-medium focus:ring-logo-gold/20 focus:border-logo-gold/50 transition-all">
                                    <SelectValue placeholder="Select a course" />
                                  </SelectTrigger>
                                  <SelectContent className="font-poppins font-medium">
                                    {courses.length > 0 ? (
                                      courses
                                        .filter((course) => course && (course.id !== undefined || course.courseId !== undefined))
                                        .map((course) => {
                                          const id = course.id || course.courseId;
                                          return (
                                            <SelectItem key={id} value={String(id)} className="font-poppins font-medium">
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

                              <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-1.5 group">
                                  <Label htmlFor="duration" className="text-sm font-medium text-slate-600 font-poppins group-focus-within:text-logo-gold transition-colors">
                                    Duration
                                  </Label>
                                  <Input
                                    id="duration"
                                    placeholder="e.g. 4 weeks"
                                    className="font-poppins font-medium focus-visible:ring-logo-gold/20 focus-visible:border-logo-gold/50 transition-all"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5 group">
                                <Label htmlFor="goal" className="text-sm font-medium text-slate-600 font-poppins group-focus-within:text-logo-gold transition-colors">
                                  Project Goal
                                </Label>
                                <Textarea
                                  id="goal"
                                  placeholder="What did you want to achieve?"
                                  className="min-h-[160px] resize-none font-poppins font-medium focus-visible:ring-logo-gold/20 focus-visible:border-logo-gold/50 transition-all"
                                  value={formData.goal}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-1.5 group">
                                  <Label htmlFor="project-link" className="text-sm font-medium text-slate-600 font-poppins group-focus-within:text-logo-gold transition-colors">
                                    Project Link
                                  </Label>
                                  <Input
                                    id="project-link"
                                    placeholder="https://github.com/..."
                                    className="font-poppins font-medium focus-visible:ring-logo-gold/20 focus-visible:border-logo-gold/50 transition-all"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="space-y-1.5 group">
                                  <Label htmlFor="project-file" className="text-sm font-medium text-slate-600 font-poppins group-focus-within:text-logo-gold transition-colors">
                                    Upload Evidence
                                  </Label>
                                  <div className="relative group">
                                    <Input
                                      id="project-file"
                                      type="file"
                                      ref={fileInputRef}
                                      onChange={handleFileChange}
                                      className="hidden"
                                      accept=".jpg,.jpeg,.png,.pdf"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => fileInputRef.current?.click()}
                                      className={`w-full h-12 font-poppins font-medium transition-all ${file ? 'bg-logo-gold/5 border-logo-gold/30' : 'hover:border-logo-gold/30'}`}
                                    >
                                      {file ? <CheckCircle2 className="h-5 w-5 text-logo-gold" /> : <Upload className="h-5 w-5 text-muted-foreground group-hover:text-logo-gold transition-colors" />}
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 pt-2">
                                <p className="text-xs text-slate-500 font-poppins font-medium leading-relaxed">
                                  By starting this project, you agree to provide authentic work, evidence, and your thought process. The verification engine will evaluate only what you submit.
                                </p>
                                <div className="flex items-start space-x-3">
                                  <Checkbox
                                    id="terms"
                                    checked={formData.acceptedTerms}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptedTerms: !!checked }))}
                                    className="mt-0.5 data-[state=checked]:bg-logo-gold data-[state=checked]:border-logo-gold"
                                  />
                                  <Label
                                    htmlFor="terms"
                                    className="text-sm cursor-pointer font-semibold text-slate-700 font-poppins"
                                  >
                                    I agree to provide authentic work and thought process for evaluation.
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 flex justify-center">
                              <Button
                                onClick={handleSubmit}
                                disabled={isSubmitDisabled || isSubmitting}
                                size="lg"
                                className="w-full sm:w-auto font-semibold font-poppins px-10 py-4 shadow-lg tracking-tight uppercase bg-logo-gold hover:bg-logo-gold/90 text-white transition-all hover:scale-105"
                              >
                                {isSubmitting ? "Processing..." : "Submit"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Side: Verification Section */}
                      <div className="space-y-8 h-full relative">
                        {/* Back button when in verification flow */}
                        {showVerification && (
                          <button
                            onClick={() => {
                              setShowVerification(false);
                              setVerificationStep("selectProject");
                              setSelectedProjectId(null);
                            }}
                            className="absolute -top-3 left-4 bg-blue-900 hover:bg-blue-800 text-white transition-colors px-4 py-2 rounded-lg font-medium text-sm"
                            title="Back button"
                          >
                            Back
                          </button>
                        )}
                        {!showVerification && !interviewSession ? (
                          <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-logo-gold/5 border-2 border-dashed border-logo-gold/20 rounded-[3rem] animate-in fade-in duration-700">
                            <div className="mb-6 p-4 bg-white rounded-full shadow-lg shadow-logo-gold/10">
                              <Lightbulb className="h-12 w-12 text-logo-gold animate-pulse" />
                            </div>
                            <h4 className="text-xl font-black text-slate-700 mb-4 font-poppins text-center">Earn a Sharable Proof of skills</h4>
                            <p className="text-slate-900 text-center mb-8 max-w-xs font-poppins text-sm leading-relaxed">
                              Gain entry to the Global AI Talent market
                            </p>
                            <Button
                              type="button"
                              onClick={() => {
                                setShowVerification(true);
                                setVerificationStep("selectProject");
                                if (portfolioProjects.length === 0) {
                                  fetchPortfolioProjects();
                                }
                              }}
                              className="font-bold py-4 px-10 rounded-2xl bg-logo-gold hover:bg-logo-gold/90 text-white transition-all text-base h-auto shadow-xl shadow-logo-gold/20 hover:-translate-y-1"
                            >
                              Get Started
                            </Button>
                          </div>
                        ) : showVerification && verificationStep === "selectProject" ? (
                          <div className="w-full space-y-6 sm:space-y-8 p-4 sm:p-8 sm:p-12 bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-700">
                            {loadingProjects ? (
                              <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-logo-blue mb-4" />
                                <p className="text-slate-500 font-semibold font-poppins">Loading your projects...</p>
                              </div>
                            ) : projectLoadError ? (
                              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                <div className="text-center space-y-3">
                                  <h3 className="text-lg font-semibold text-slate-800 font-poppins">Unable to load projects</h3>
                                  <p className="text-sm text-slate-600 font-poppins max-w-sm leading-relaxed">
                                    {projectLoadError}
                                  </p>
                                </div>
                                <Button
                                  onClick={() => fetchPortfolioProjects(true)}
                                  className="bg-logo-gold hover:bg-logo-gold/90 text-white font-bold py-3 px-8 rounded-lg transition-all"
                                >
                                  Try Again
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-3 text-center">
                                  <h3 className="text-lg font-semibold text-slate-800 font-poppins">Select Your Project</h3>
                                  <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed font-poppins">
                                    Choose which project you want to prove your thought process for:
                                  </p>
                                </div>

                                <div className="space-y-1.5 group flex-1 text-center">
                                  <Label htmlFor="project-select" className="text-sm font-medium text-slate-600 font-poppins group-focus-within:text-logo-gold transition-colors inline-block">
                                    Select a Project
                                  </Label>
                                  <Select
                                    value={selectedProjectId ? String(selectedProjectId) : ""}
                                    onValueChange={(val) => {
                                      setSelectedProjectId(Number(val));
                                      setVerificationStep("selectPath");
                                    }}
                                  >
                                    <SelectTrigger id="project-select" className="font-poppins font-medium focus:ring-logo-gold/20 focus:border-logo-gold/50 transition-all">
                                      <SelectValue placeholder="Choose a project..." />
                                    </SelectTrigger>
                                    <SelectContent className="font-poppins font-medium">
                                      {portfolioProjects.length > 0 ? (
                                        portfolioProjects.map((project) => {
                                          const projectId = project.projectId || project.id;
                                          const projectName = project.projectName || project.name || "Unnamed Project";
                                          return (
                                            <SelectItem key={projectId} value={String(projectId)} className="font-poppins font-medium">
                                              {projectName}
                                            </SelectItem>
                                          );
                                        })
                                      ) : (
                                        <SelectItem value="0" disabled>No projects available</SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            )}
                          </div>
                        ) : selectedProjectId && !interviewSession ? (
                          <div className="w-full space-y-6 sm:space-y-8 p-4 sm:p-8 bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="space-y-4">
                              <h3 className="text-xl font-semibold text-slate-800 font-poppins">Your Journey</h3>
                              <p className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed font-poppins">
                                Hello there. Before we get started, I need to know how you tackled this project. Which of these paths sounds most like you?
                              </p>
                            </div>

                            <div className="space-y-4 sm:space-y-6 flex-1">
                              {[
                                { id: 'path-a', value: 'Path A', title: 'The Artisan', description: 'I did it all by hand. No AI, just my own hard work.', icon: '✍️' },
                                { id: 'path-b', value: 'Path B', title: 'The Architect', description: 'I used AI to help with the heavy lifting, but I checked every bit of it.', icon: '📐' },
                                { id: 'path-c', value: 'Path C', title: 'The Orchestrator', description: 'I set up a system of AI tools to build it, focusing on integration.', icon: '🎼' }
                              ].map((path) => (
                                <div
                                  key={path.id}
                                  className={`flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-3xl border-2 transition-all cursor-pointer group hover:scale-[1.02] ${formData.verificationText === path.value ? 'bg-logo-gold/5 border-logo-gold shadow-xl shadow-logo-gold/5' : 'bg-slate-50/50 border-slate-100 hover:border-logo-gold/30'}`}
                                  onClick={() => startInterview(path)}
                                >
                                  <div className="text-2xl pt-0 sm:pt-1">{path.icon}</div>
                                  <div className="flex-1 space-y-2 sm:space-y-1 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                      <p className={`font-semibold text-sm uppercase tracking-widest font-poppins ${formData.verificationText === path.value ? 'text-logo-gold' : 'text-slate-400'}`}>
                                        {path.title}
                                      </p>
                                      {isInterviewLoading && formData.verificationText === path.value ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-logo-gold" />
                                      ) : (
                                        <Checkbox
                                          id={path.id}
                                          checked={formData.verificationText === path.value}
                                          className="h-5 w-5 data-[state=checked]:bg-logo-gold data-[state=checked]:border-logo-gold rounded-lg border-2"
                                          onCheckedChange={() => startInterview(path)}
                                        />
                                      )}
                                    </div>
                                    <Label htmlFor={path.id} className={`text-sm font-semibold font-poppins transition-colors leading-relaxed block cursor-pointer ${formData.verificationText === path.value ? 'text-slate-900' : 'text-slate-600'}`}>
                                      {path.description}
                                    </Label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : !showVerification && interviewSession ? (
                          // Resume active interview when user is back at "Get Started" screen
                          <div className="w-full space-y-6 sm:space-y-8 p-4 sm:p-8 sm:p-12 bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-700">
                            {interviewSession.isCompleted ? (
                              <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                  <CheckCircle2 className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 font-poppins">Auditing completed</h3>
                                <p className="text-slate-500 max-w-sm font-medium leading-relaxed font-poppins text-base">
                                  Your thought process report will be ready within 2 minutes.
                                </p>
                                <p className="text-sm font-semibold text-slate-500">
                                  View and generate report are available in Portfolio → My Projects.
                                </p>
                                {isInterviewLoading && (
                                  <div className="mt-4 flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" aria-live="polite">
                                    <Loader2 className="h-4 w-4 animate-spin text-logo-gold" />
                                    <span>your thought process report is being processed. It will be out in a moment...</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-8 flex-1 flex flex-col animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-logo-gold">
                                    <div className="flex flex-col gap-1">
                                      <span>{typeof interviewSession.currentPillar === 'number' ? `Pillar ${interviewSession.currentPillar}` : (interviewSession.currentPillar || "Current Section")}</span>
                                      <span>Question {interviewSession.questionIndex + 1 || 1}</span>
                                    </div>
                                    {interviewSession.questionServedAt && interviewSession.maxTimeSeconds && (
                                      <CountdownTimer
                                        questionServedAt={interviewSession.questionServedAt}
                                        maxTimeSeconds={interviewSession.maxTimeSeconds}
                                        onTimeUp={handleTimeUp}
                                      />
                                    )}
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-logo-gold transition-all duration-1000"
                                      style={{ width: `${Math.min(((interviewSession.questionIndex || 1) / 5) * 100, 100)}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                  <h3 className="text-sm sm:text-base font-medium text-slate-700 font-poppins leading-relaxed">
                                    {interviewSession.currentQuestion}
                                  </h3>

                                  <div className="space-y-4 pt-4 relative">
                                    <Label htmlFor="current-answer" className="text-sm font-semibold">
                                      Your Response
                                    </Label>
                                    {isTimeUp && (
                                      <div className="absolute inset-x-0 -top-2 flex justify-center z-10">
                                        <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
                                          TIME IS UP
                                        </div>
                                      </div>
                                    )}
                                    <Textarea
                                      id="current-answer"
                                      placeholder={isTimeUp ? "Time has expired for this question." : "Type your answer here..."}
                                      value={currentAnswer}
                                      onChange={(e) => setCurrentAnswer(e.target.value)}
                                      onPaste={(e) => e.preventDefault()}
                                      onContextMenu={(e) => e.preventDefault()}
                                      onKeyDown={(e) => {
                                        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
                                          e.preventDefault();
                                        }
                                      }}
                                      className={`min-h-[160px] resize-none ${isTimeUp ? 'opacity-50 grayscale' : ''} focus-visible:ring-logo-gold/20 focus-visible:border-logo-gold/50`}
                                      disabled={isInterviewLoading || isTimeUp}
                                    />
                                  </div>
                                </div>

                                <div className="pt-8 flex justify-center">
                                  <Button
                                    onClick={submitInterviewAnswer}
                                    disabled={isInterviewLoading || (!currentAnswer.trim() && !isTimeUp)}
                                    className="w-full sm:w-auto font-black py-6 px-16 rounded-2xl bg-logo-gold hover:bg-logo-gold/90 text-white shadow-2xl shadow-logo-gold/20 hover:-translate-y-1 transition-all text-base h-auto disabled:opacity-50"
                                  >
                                    {isInterviewLoading ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : isTimeUp ? (
                                      "Time's Up - Next"
                                    ) : (
                                      "Continue"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full space-y-6 sm:space-y-8 p-4 sm:p-8 sm:p-12 bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-700">
                            {interviewSession ? (
                              interviewSession.isCompleted ? (
                                <div className="flex flex-col items-center justify-center text-center space-y-6 py-12 animate-in zoom-in-95 duration-500">
                                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                                    <CheckCircle2 className="h-10 w-10" />
                                  </div>
                                  <h3 className="text-2xl font-black text-slate-800 font-poppins">Auditing completed</h3>
                                  <p className="text-slate-500 max-w-sm font-medium leading-relaxed font-poppins text-base">
                                    Your thought process report will be ready within 2 minutes.
                                  </p>
                                  <p className="text-sm font-semibold text-slate-500">
                                  View and generate report are available in Portfolio → My Projects.
                                </p>
                                  {isInterviewLoading && (
                                    <div className="mt-4 flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600" aria-live="polite">
                                      <Loader2 className="h-4 w-4 animate-spin text-logo-gold" />
                                      <span>your thought process report is being processed. It will be out in a moment...</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-8 flex-1 flex flex-col animate-in slide-in-from-right-4 duration-500">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-logo-gold">
                                      <div className="flex flex-col gap-1">
                                        <span>{typeof interviewSession.currentPillar === 'number' ? `Pillar ${interviewSession.currentPillar}` : (interviewSession.currentPillar || "Current Section")}</span>
                                        <span>Question {interviewSession.questionIndex + 1 || 1}</span>
                                      </div>
                                      {interviewSession.questionServedAt && interviewSession.maxTimeSeconds && (
                                        <CountdownTimer
                                          questionServedAt={interviewSession.questionServedAt}
                                          maxTimeSeconds={interviewSession.maxTimeSeconds}
                                          onTimeUp={handleTimeUp}
                                        />
                                      )}
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-logo-gold transition-all duration-1000"
                                        style={{ width: `${Math.min(((interviewSession.questionIndex || 1) / 5) * 100, 100)}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="flex-1 space-y-6">
                                    <h3 className="text-sm sm:text-base font-medium text-slate-700 font-poppins leading-relaxed">
                                    {interviewSession.currentQuestion}
                                  </h3>

                                    <div className="space-y-4 pt-4 relative">
                                      <Label htmlFor="current-answer" className="text-sm font-semibold">
                                        Your Response
                                      </Label>
                                      {isTimeUp && (
                                        <div className="absolute inset-x-0 -top-2 flex justify-center z-10">
                                          <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
                                            TIME IS UP
                                          </div>
                                        </div>
                                      )}
                                      <Textarea
                                        id="current-answer"
                                        placeholder={isTimeUp ? "Time has expired for this question." : "Type your answer here..."}
                                        value={currentAnswer}
                                        onChange={(e) => setCurrentAnswer(e.target.value)}
                                        onPaste={(e) => e.preventDefault()}
                                        onContextMenu={(e) => e.preventDefault()}
                                        onKeyDown={(e) => {
                                          if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
                                            e.preventDefault();
                                          }
                                        }}
                                        className={`min-h-[160px] resize-none ${isTimeUp ? 'opacity-50 grayscale' : ''} focus-visible:ring-logo-gold/20 focus-visible:border-logo-gold/50`}
                                        disabled={isInterviewLoading || isTimeUp}
                                      />
                                    </div>
                                  </div>

                                  <div className="pt-8 flex justify-center">
                                    <Button
                                      onClick={submitInterviewAnswer}
                                      disabled={isInterviewLoading || (!currentAnswer.trim() && !isTimeUp)}
                                      className="w-full sm:w-auto font-black py-6 px-16 rounded-2xl bg-logo-gold hover:bg-logo-gold/90 text-white shadow-2xl shadow-logo-gold/20 hover:-translate-y-1 transition-all text-base h-auto disabled:opacity-50"
                                    >
                                      {isInterviewLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                      ) : isTimeUp ? (
                                        "Time's Up - Next"
                                      ) : (
                                        "Continue"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )
                            ) : (
                              <>
                                <div className="space-y-4">
                                  <h3 className="text-xl font-semibold text-slate-800 font-poppins">Your Journey</h3>
                                  <p className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed font-poppins">
                                    Hello there. Before we get started, I need to know how you tackled this project. Which of these paths sounds most like you?
                                  </p>
                                </div>

                                <div className="space-y-4 sm:space-y-6 flex-1">
                                  {[
                                    { id: 'path-a', value: 'Path A', title: 'The Artisan', description: 'I did it all by hand. No AI, just my own hard work.', icon: '✍️' },
                                    { id: 'path-b', value: 'Path B', title: 'The Architect', description: 'I used AI to help with the heavy lifting, but I checked every bit of it.', icon: '📐' },
                                    { id: 'path-c', value: 'Path C', title: 'The Orchestrator', description: 'I set up a system of AI tools to build it, focusing on integration.', icon: '🎼' }
                                  ].map((path) => (
                                    <div
                                  key={path.id}
                                  className={`flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-3xl border-2 transition-all cursor-pointer group hover:scale-[1.02] ${formData.verificationText === path.value ? 'bg-logo-gold/5 border-logo-gold shadow-xl shadow-logo-gold/5' : 'bg-slate-50/50 border-slate-100 hover:border-logo-gold/30'}`}
                                  onClick={() => startInterview(path)}
                                >
                                  <div className="text-2xl pt-0 sm:pt-1">{path.icon}</div>
                                  <div className="flex-1 space-y-2 sm:space-y-1 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                      <p className={`font-semibold text-sm uppercase tracking-widest font-poppins ${formData.verificationText === path.value ? 'text-logo-gold' : 'text-slate-400'}`}>
                                        {path.title}
                                      </p>
                                      {isInterviewLoading && formData.verificationText === path.value ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-logo-gold" />
                                      ) : (
                                        <Checkbox
                                          id={path.id}
                                          checked={formData.verificationText === path.value}
                                          className="h-5 w-5 data-[state=checked]:bg-logo-gold data-[state=checked]:border-logo-gold rounded-lg border-2"
                                          onCheckedChange={() => startInterview(path)}
                                        />
                                      )}
                                    </div>
                                    <Label htmlFor={path.id} className={`text-sm font-semibold font-poppins transition-colors leading-relaxed block cursor-pointer ${formData.verificationText === path.value ? 'text-slate-900' : 'text-slate-600'}`}>
                                      {path.description}
                                    </Label>
                                  </div>
                                </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Projects;
