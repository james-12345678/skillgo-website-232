import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SimplePDFViewer } from "@/components/SimplePDFViewer";
import { Briefcase, Target, Clock, Mail, Calendar, Search, GraduationCap, Share2, Copy, MessageSquare, Check, Upload, Eye, FileText, X, CheckCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, apiUrl, isAuthExpired } from "@/lib/api";
import { ALL_COUNTRIES } from "@/lib/countries";
import { toast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";

const isPdfUrl = (value: string | null | undefined) => typeof value === "string" && /\.pdf(\?|#|$)/i.test(value);

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

const normalizeBoolean = (value: any) => {
  if (value === true) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

const normalizeExternalUrl = (value: any) => {
  const url = normalizeApiValue(value);
  if (typeof url !== "string") return null;

  if (/^[a-z][a-z\d+\-.]*:/i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/") || url.startsWith(".") || url.startsWith("#")) return url;
  if (/^[^\s/?#]+\.[^\s/?#]+(?:[/?#].*)?$/i.test(url)) return `https://${url}`;

  return url;
};

const educationLevelMap: Record<number | string, string> = {
  0: "Certificate",
  1: "Diploma",
  2: "Degree",
  3: "Masters",
  4: "PhD",
  certificate: "Certificate",
  diploma: "Diploma",
  degree: "Degree",
  masters: "Masters",
  phd: "PhD",
};

const getEducationLevelLabel = (level: any): string => {
  if (typeof level === "number") {
    return educationLevelMap[level] || "Unknown";
  }
  if (typeof level === "string") {
    const numValue = parseInt(level, 10);
    if (!isNaN(numValue)) {
      return educationLevelMap[numValue] || level;
    }
    return educationLevelMap[level.toLowerCase()] || level;
  }
  return "Unknown";
};

interface EnumOption {
  id: string;
  name: string;
}

interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}


interface SharePortfolioResponse {
  link?: string;
}

const GENERATED_FORENSIC_REPORTS_STORAGE_KEY = "portfolio-generated-forensic-reports";
const ACCEPTED_PAYMENT_CODES_STORAGE_KEY = "portfolio-accepted-payment-codes";

const REPORT_PATH_DESCRIPTIONS = [
  {
    title: "Path A: The Artisan",
    description: "I did it all by hand. No AI, just my own hard work.",
  },
  {
    title: "Path B: The Architect",
    description: "I used AI to help with the heavy lifting, but I checked every bit of it.",
  },
  {
    title: "Path C: The Orchestrator",
    description: "I set up a system of AI tools to build it, focusing on integration.",
  },
];

const PAYMENT_CODE_PATTERN = /^SKGV(\d{4})$/;
const MIN_PAYMENT_CODE = 1;
const MAX_PAYMENT_CODE = 60;

const normalizePaymentCode = (value: string) => value.trim().toUpperCase();

const isValidPaymentCode = (value: string) => {
  const match = normalizePaymentCode(value).match(PAYMENT_CODE_PATTERN);
  if (!match) return false;

  const codeNumber = Number(match[1]);
  return codeNumber >= MIN_PAYMENT_CODE && codeNumber <= MAX_PAYMENT_CODE;
};

const normalizeForensicReport = (raw: any) => {
  let parsed: any;

  if (typeof raw === "object" && raw !== null) {
    parsed = raw;
  } else if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return raw;
    }
  } else {
    return raw;
  }

  while (parsed && typeof parsed === "object") {
    if (parsed.data?.aiResult) {
      parsed = parsed.data;
      continue;
    }

    if (parsed.aiResult) {
      parsed = parsed.aiResult;
      continue;
    }

    if ("data" in parsed) {
      parsed = parsed.data;
      continue;
    }

    if ("content" in parsed) {
      const content = parsed.content;
      if (typeof content === "string") {
        try {
          parsed = JSON.parse(content);
          continue;
        } catch {
          return content;
        }
      }

      parsed = content;
      continue;
    }

    break;
  }

  return parsed;
};

const formatReportLabel = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const REPORT_SUMMARY_KEYS = new Set(["score", "status", "rating", "overall"]);

const tryParseReportJsonString = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const getReportHeadingClass = (depth: number) => {
  if (depth === 0) return "text-base font-black text-logo-blue";
  if (depth === 1) return "text-sm font-bold text-logo-blue/90";
  return "text-xs font-bold uppercase tracking-widest text-slate-500";
};

const renderReportSections = (entries: [string, any][], depth = 0): ReactNode => {
  const visibleEntries = entries.filter(([key, value]) => {
    if (depth === 0 && REPORT_SUMMARY_KEYS.has(key)) return false;
    return value !== undefined && value !== null && value !== "";
  });

  if (visibleEntries.length === 0) {
    return <span className="text-sm text-slate-400">No details available</span>;
  }

  return (
    <div className="space-y-4 text-center">
      {visibleEntries.map(([key, rawValue]) => {
        const value = typeof rawValue === "string" ? tryParseReportJsonString(rawValue) : rawValue;

        if (key.trim().toLowerCase() === "header") {
          return (
            <section key={`${depth}-${key}`}>
              {renderReportValue(value, depth + 1)}
            </section>
          );
        }

        return (
          <section
            key={`${depth}-${key}`}
            className="rounded-2xl border border-logo-gold/15 bg-white p-5 shadow-sm shadow-logo-gold/5 text-center"
          >
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-logo-gold shrink-0" />
                <div className="min-w-0 text-center">
                  <h4 className={getReportHeadingClass(depth)}>{formatReportLabel(key)}</h4>
                </div>
              </div>
              {renderReportValue(value, depth + 1)}
            </div>
          </section>
        );
      })}
    </div>
  );
};

const renderReportValue = (value: any, depth = 0): ReactNode => {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">—</span>;
  }

  if (typeof value === "string") {
    const parsedValue = tryParseReportJsonString(value);
    if (parsedValue !== value) {
      return renderReportValue(parsedValue, depth);
    }

    return <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 text-center">{value}</p>;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return <span className="inline-flex rounded-full bg-logo-gold/10 px-3 py-1 text-sm font-semibold text-logo-blue">{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-slate-400 text-sm">No items</span>;
    }

    const hasStructuredItems = value.some((item) => {
      const parsedItem = typeof item === "string" ? tryParseReportJsonString(item) : item;
      return Array.isArray(parsedItem) || (typeof parsedItem === "object" && parsedItem !== null);
    });

    if (!hasStructuredItems) {
      return (
        <ul className="space-y-2 p-0 text-sm text-slate-700 list-none text-center">
          {value.map((item, index) => (
            <li key={index} className="leading-relaxed">
              {String(item)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => {
          const parsedItem = typeof item === "string" ? tryParseReportJsonString(item) : item;
          const isEvenItem = index % 2 === 0;
          const cardClasses = isEvenItem
            ? "rounded-2xl border border-blue-300 bg-gradient-to-br from-blue-100 via-white to-blue-50 p-4 text-center shadow-sm shadow-blue-200/40"
            : "rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-100 via-white to-yellow-50 p-4 text-center shadow-sm shadow-amber-200/40";
          const labelClasses = isEvenItem
            ? "mb-3 text-xs font-bold uppercase tracking-widest text-blue-700"
            : "mb-3 text-xs font-bold uppercase tracking-widest text-amber-700";

          return (
            <div key={index} className={cardClasses}>
              <p className={labelClasses}>Item {index + 1}</p>
              {renderReportValue(parsedItem, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  }

  if (typeof value === "object") {
    return renderReportSections(Object.entries(value), depth);
  }

  return <span className="text-sm text-slate-700">{String(value)}</span>;
};

const readGeneratedForensicReports = () => {
  try {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(GENERATED_FORENSIC_REPORTS_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.entries(parsed).reduce<Record<number, boolean>>((acc, [projectId, value]) => {
      const normalizedProjectId = Number(projectId);
      if (!Number.isFinite(normalizedProjectId) || value !== true) {
        return acc;
      }

      acc[normalizedProjectId] = true;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const readAcceptedPaymentCodes = () => {
  try {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem(ACCEPTED_PAYMENT_CODES_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.entries(parsed).reduce<Record<number, boolean>>((acc, [projectId, value]) => {
      const normalizedProjectId = Number(projectId);
      if (!Number.isFinite(normalizedProjectId) || value !== true) {
        return acc;
      }

      acc[normalizedProjectId] = true;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const getForensicReportResponseMessage = async (response: Response) => {
  const responseText = await response.text().catch(() => "");
  const trimmedResponseText = responseText.trim();

  if (!trimmedResponseText) {
    return "";
  }

  try {
    const parsed = JSON.parse(trimmedResponseText);

    if (typeof parsed === "string") {
      return parsed.trim();
    }

    if (typeof parsed?.message === "string") {
      return parsed.message.trim();
    }

    if (typeof parsed?.data?.message === "string") {
      return parsed.data.message.trim();
    }

    if (typeof parsed?.error === "string") {
      return parsed.error.trim();
    }

    if (typeof parsed?.detail === "string") {
      return parsed.detail.trim();
    }
  } catch {
    // Response is plain text; use it as-is.
  }

  return trimmedResponseText;
};

const Portfolio = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showDetailedInfo, setShowDetailedInfo] = useState<number | null>(null);
  const [searchName, setSearchName] = useState("");
  const [searchExperience, setSearchExperience] = useState("");
  const [currentTab, setCurrentTab] = useState("projects");

  // Experience State
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [loadingExp, setLoadingExp] = useState(true);

  // Education State
  const [searchEducation, setSearchEducation] = useState("");
  const [educations, setEducations] = useState<any[]>([]);
  const [loadingEducation, setLoadingEducation] = useState(true);

  // Projects State
  const [realProjects, setRealProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Share & Feedback State
  const [shareLink, setShareLink] = useState("");
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countries, setCountries] = useState<EnumOption[]>(ALL_COUNTRIES);
  const [copied, setCopied] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [viewingFile, setViewingFile] = useState<{url: string, name: string, type: string, projectId: number} | null>(null);
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [fileBlobUrl, setFileBlobUrl] = useState<string | null>(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [viewingReport, setViewingReport] = useState<{ projectId: number; projectName: string } | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportCodeDialogOpen, setReportCodeDialogOpen] = useState(false);
  const [reportCodeInput, setReportCodeInput] = useState("");
  const [reportCodeError, setReportCodeError] = useState("");
  const [reportCodeVerified, setReportCodeVerified] = useState(false);
  const [pendingReportProject, setPendingReportProject] = useState<{ id: number; name: string } | null>(null);
  const [acceptedPaymentCodeProjects, setAcceptedPaymentCodeProjects] = useState<Record<number, boolean>>(() => readAcceptedPaymentCodes());
  const [generatedForensicReports, setGeneratedForensicReports] = useState<Record<number, boolean>>(() => readGeneratedForensicReports());
  const [generatingForensicReports, setGeneratingForensicReports] = useState<Record<number, boolean>>({});
  const autoOpenedReportProjectId = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(ACCEPTED_PAYMENT_CODES_STORAGE_KEY, JSON.stringify(acceptedPaymentCodeProjects));
    } catch {
      // ignore storage errors
    }
  }, [acceptedPaymentCodeProjects]);

  useEffect(() => {
    try {
      localStorage.setItem(GENERATED_FORENSIC_REPORTS_STORAGE_KEY, JSON.stringify(generatedForensicReports));
    } catch {
      // ignore storage errors
    }
  }, [generatedForensicReports]);

  const hasAcceptedPaymentCode = (project: any) => {
    if (!project?.id) return false;
    return acceptedPaymentCodeProjects[project.id] === true;
  };

  const hasGeneratedForensicReport = (project: any) => {
    if (!project?.id) return false;
    return generatedForensicReports[project.id] === true;
  };

  const handleViewReport = async (project: any) => {
    if (!project?.id) return false;

    try {
      setIsLoadingReport(true);
      setViewingReport(null);
      setReportData(null);
      const reportQuery = new URLSearchParams({
        projectId: String(project.id),
      });
      const response = await apiFetch(`/api/projects/get-project-feedback/${project.id}?${reportQuery.toString()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache, no-store, max-age=0",
          Pragma: "no-cache",
        },
      });

      if (response.ok) {
        const reportJson = await response.json();
        const normalizedReport = normalizeForensicReport(reportJson);
        setViewingReport({
          projectId: project.id,
          projectName: project.name || "Untitled Project",
        });
        setReportData(normalizedReport);
        return true;
      }

      if (isAuthExpired(response)) {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again to continue.",
          variant: "destructive",
        });
        return false;
      }

      const errorText = await response.text().catch(() => "");
      if (response.status === 400 || response.status === 404) {
        setViewingReport({
          projectId: project.id,
          projectName: project.name || "Untitled Project",
        });
        setReportData(null);
        return false;
      }

      toast({
        title: "Unable to load report",
        description: errorText || "We couldn't fetch the project report right now.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error("Error loading report:", error);
      toast({
        title: "Unable to load report",
        description: "We couldn't fetch the project report right now.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Fetch file as blob with AbortController for optimization
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

  // Convert blob to ArrayBuffer for PDF viewer
  useEffect(() => {
    const isPdf = fileBlob && (
      fileBlob.type === "application/pdf" ||
      viewingFile?.type === "application/pdf" ||
      viewingFile?.name?.toLowerCase().endsWith('.pdf')
    );

    if (fileBlob && isPdf) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result instanceof ArrayBuffer) {
          setPdfArrayBuffer(result);
        } else {
          setPdfArrayBuffer(null);
        }
      };
      reader.onerror = () => {
        setPdfArrayBuffer(null);
      };
      reader.readAsArrayBuffer(fileBlob);
    } else {
      setPdfArrayBuffer(null);
    }
  }, [fileBlob, viewingFile?.type, viewingFile?.name]);

  // Auto-expand project based on URL parameters
  useEffect(() => {
    const projectId = searchParams.get("project");
    const expand = searchParams.get("expand");
    const tab = searchParams.get("tab");

    if (tab) {
      setCurrentTab(tab);
    }

    if (projectId && realProjects.length > 0) {
      const id = parseInt(projectId, 10);
      setSelectedProjectId(id);

      // Auto-open file view and report if expand=true is provided
      if (expand === "true" && (!viewingFile || viewingFile.projectId !== id)) {
        const project = realProjects.find(p => p.id === id);
        if (project) {
          const isExternalEvidence = Boolean(project.isExternalEvidenceLink);
          const evidenceUrl = project.fileUrl || (project.link ? normalizeExternalUrl(project.link) : null);

          if (!evidenceUrl) return;

          if (isExternalEvidence) {
            window.open(evidenceUrl, "_blank", "noopener,noreferrer");
            return;
          }

          setViewingFile({
            projectId: project.id,
            url: evidenceUrl,
            name: project.fileName || "Project Document",
            type: project.mimeType || (isPdfUrl(evidenceUrl) ? 'application/pdf' : 'application/octet-stream')
          });
        }
      }
    }
  }, [searchParams, realProjects]);

  useEffect(() => {
    const shouldOpenReport = searchParams.get("openReport") === "true";
    const projectIdParam = searchParams.get("project");
    if (!shouldOpenReport || !projectIdParam || realProjects.length === 0) return;

    const projectId = Number(projectIdParam);
    if (!Number.isFinite(projectId) || autoOpenedReportProjectId.current === projectId) return;

    const project = realProjects.find((item) => item.id === projectId);
    if (!project) return;

    autoOpenedReportProjectId.current = projectId;
    setSelectedProjectId(projectId);
  }, [searchParams, realProjects]);


  // Fetch Countries for Feedback - Only when feedback tab is accessed
  useEffect(() => {
    if (currentTab !== "feedback") return;

    const fetchCountries = async () => {
      try {
        const res = await apiFetch("/api/enums/all-enums");
        if (res.ok) {
          const apiResponse = await res.json();
          const data = apiResponse.data || apiResponse;
          if (Array.isArray(data.Country)) {
            const transformedCountries = data.Country.map((item: any) => ({
              id: String(item.key),
              name: item.value,
            }));

            // Merge with ALL_COUNTRIES, preferring API data for same names to keep IDs consistent
            setCountries(prev => {
              const countryMap = new Map<string, EnumOption>();

              // Seed with hardcoded list
              ALL_COUNTRIES.forEach(c => countryMap.set(c.name.toLowerCase(), c));

              // Overwrite/Add with API data
              transformedCountries.forEach(apiCountry => {
                if (apiCountry.id && apiCountry.id !== "undefined" && apiCountry.name) {
                  countryMap.set(apiCountry.name.toLowerCase(), apiCountry);
                }
              });

              // Ensure ID uniqueness
              const idMap = new Map<string, EnumOption>();
              Array.from(countryMap.values()).forEach(c => {
                idMap.set(c.id, c);
              });

              return Array.from(idMap.values()).sort((a, b) => a.name.localeCompare(b.name));
            });
          }
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, [currentTab]);

  // Fetch Experience Data - Only when experience tab is accessed
  useEffect(() => {
    if (currentTab !== "experience") return;

    const fetchExperiences = async () => {
      try {
        setLoadingExp(true);
        const res = await apiFetch("/api/Users/WorkExperience/all-work-experiences");
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.data || [];
          const itemsWithIds = items.map((item: any) => ({
            ...item,
            id: item.id || item.workExperienceId || item.experienceId || item.WorkExperienceId,
            company: item.company || item.Company,
            role: item.role || item.Role,
            startDate: item.startDate || item.StartDate,
            endDate: item.endDate || item.EndDate,
            description: item.description || item.Description,
          }));
          setExperiences(itemsWithIds);
        } else if (isAuthExpired(res)) {
          console.log("User session expired (401) while fetching experiences");
          toast({
            title: "Session expired",
            description: "Your session has expired. Please log in again to continue.",
            variant: "destructive",
          });
        } else {
          console.error("Failed to fetch experiences, status:", res.status);
        }
      } catch (error) {
        console.error("Error fetching experiences:", error);
        toast({
          title: "Unable to load work experience",
          description: "We're having trouble loading your work experience. Please refresh the page or try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingExp(false);
      }
    };

    fetchExperiences();
  }, [currentTab]);

  // Fetch Education Data
  useEffect(() => {
    const fetchEducation = async () => {
      try {
        setLoadingEducation(true);
        const res = await apiFetch("/api/users/education/all-education");
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.data || [];
          const itemsWithIds = items.map((item: any) => ({
            ...item,
            id: item.id || item.educationId || item.EducationId,
            educationLevel: getEducationLevelLabel(item.educationLevel || item.EducationLevel),
            school: item.school || item.School,
            startDate: item.startDate || item.StartDate,
            endDate: item.endDate || item.EndDate,
            fieldOfStudy: item.fieldOfStudy || item.FieldOfStudy,
          }));
          setEducations(itemsWithIds);
        } else if (isAuthExpired(res)) {
          console.log("User session expired (401) while fetching education");
          toast({
            title: "Session expired",
            description: "Your session has expired. Please log in again to continue.",
            variant: "destructive",
          });
        } else {
          console.error("Failed to fetch education, status:", res.status);
        }
      } catch (error) {
        console.error("Error fetching education:", error);
        toast({
          title: "Unable to load education",
          description: "We're having trouble loading your education. Please refresh the page or try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingEducation(false);
      }
    };

    fetchEducation();
  }, [currentTab]);

  // Fetch Projects Data
  const fetchProjects = async (page: number, size: number) => {
    try {
      setLoadingProjects(true);
      const res = await apiFetch(`/api/projects?pageNumber=${page}&pageSize=${size}`);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.items || data.data || []);

        // Detect pagination from backend structure if possible
        if (data.totalCount || data.totalPages) {
          setTotalPages(data.totalPages || 1);
        }

        // If items are fewer than requested size, it's likely the last page
        setHasMore(items.length === size);

        // Map API data to UI structure
        const mappedProjects = items.map((item: any) => {
          const createdDate = item.createdDate || item.CreatedDate || new Date().toISOString();
          const year = new Date(createdDate).getFullYear().toString();

          // Exhaustive property search to handle any backend naming convention
          const findProp = (obj: any, target: string) => {
            if (!obj) return null;
            const targetLower = target.toLowerCase();

            const exactValue = normalizeApiValue(obj[target]);
            if (exactValue !== null) return exactValue;

            for (const key of Object.keys(obj)) {
              if (key.toLowerCase() === targetLower) {
                const matchedValue = normalizeApiValue(obj[key]);
                if (matchedValue !== null) return matchedValue;
              }
            }

            if (obj.project && typeof obj.project === 'object') {
              const nested = findProp(obj.project, target);
              if (nested !== null) return nested;
            }
            if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
              const nested = findProp(obj.data, target);
              if (nested !== null) return nested;
            }
            return null;
          };

          const mime = findProp(item, 'mimeType') || findProp(item, 'contentType') || findProp(item, 'mime_type') || findProp(item, 'content_type') || findProp(item, 'MimeType') || findProp(item, 'ContentType');
          const url = findProp(item, 'fileUrl') || findProp(item, 'imageURL') || findProp(item, 'url') || findProp(item, 'file_url') || findProp(item, 'FileUrl') || findProp(item, 'ImageURL');
          const fileName = findProp(item, 'fileName') || findProp(item, 'originalFileName') || findProp(item, 'originalName') || findProp(item, 'imageFilename') || findProp(item, 'file_name') || findProp(item, 'name_original') || findProp(item, 'FileName') || findProp(item, 'OriginalFileName');
          const name = findProp(item, 'name') || findProp(item, 'projectName') || findProp(item, 'ProjectName') || findProp(item, 'Name');
          const id = findProp(item, 'projectId') || findProp(item, 'ProjectId') || findProp(item, 'id') || findProp(item, 'Id');
          const goal = findProp(item, 'goal') || findProp(item, 'Goal') || findProp(item, 'projectGoal');
          const duration = findProp(item, 'duration') || findProp(item, 'Duration');
          const link = findProp(item, 'link') || findProp(item, 'Link');
          const storedFileName = findProp(item, 'storedFileName') || findProp(item, 'StoredFileName') || findProp(item, 'stored_file_name');
          const thoughtProcess = findProp(item, 'thoughtProcess') || findProp(item, 'ThinkingProcess') || findProp(item, 'thinking_process') || findProp(item, 'thought_process');
          const normalizedLink = normalizeExternalUrl(link);
          const evidenceUrl = url || (link && !url ? normalizeExternalUrl(link) : null);
          const isExternalEvidenceLink = Boolean(
            normalizeBoolean(findProp(item, 'isExternalEvidenceLink')) ||
            (mime && String(mime).toLowerCase() === 'text/uri-list') ||
            (!url && !!link)
          );

          const finalFileName = fileName || storedFileName || null;

          return {
            id: id || Math.random(),
            name: name || "Untitled Project",
            year: year,
            goal: goal || "Not specified",
            duration: duration || "Not specified",
            link: normalizedLink,
            imageURL: evidenceUrl,
            fileName: finalFileName,
            storedFileName: storedFileName || fileName || null,
            mimeType: mime || null,
            fileUrl: evidenceUrl,
            thoughtProcess: thoughtProcess,
            isExternalEvidenceLink,
          };
        });

        setRealProjects(mappedProjects);
      } else if (isAuthExpired(res)) {
        console.log("User session expired (401) while fetching projects");
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again to continue.",
          variant: "destructive",
        });
      } else {
        console.error("Failed to fetch projects, status:", res.status);
        toast({
          title: "Unable to load projects",
          description: "We're having trouble loading your projects. Please refresh the page or try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const projectParam = searchParams.get("project");
  const expandedProjectList = Boolean(searchName || projectParam);

  // Fetch Projects Data on tab change or page change
  useEffect(() => {
    if (currentTab === "projects") {
      const shouldFetchExpandedProjectList = Boolean(searchName || projectParam);
      const pageToFetch = shouldFetchExpandedProjectList ? 1 : currentPage;
      const sizeToFetch = shouldFetchExpandedProjectList ? 100 : pageSize;
      fetchProjects(pageToFetch, sizeToFetch);
    }
  }, [currentTab, currentPage, pageSize, searchName, searchParams, projectParam]);

  // Reset to page 1 when searching
  useEffect(() => {
    if (searchName && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchName]);

  const filteredProjects = useMemo(() => {
    if (!searchName) return realProjects; // No longer slice(0,3) here because server-side pagination is active
    return realProjects.filter(p =>
      p.name?.toLowerCase().includes(searchName.toLowerCase())
    );
  }, [realProjects, searchName]);

  const filteredExperiences = useMemo(() => {
    let filtered = experiences;
    if (searchExperience) {
      filtered = experiences.filter(exp =>
        exp.company?.toLowerCase().includes(searchExperience.toLowerCase()) ||
        exp.role?.toLowerCase().includes(searchExperience.toLowerCase())
      );
    }
    // Sort by endDate descending (most recent first), then by startDate descending
    return filtered.sort((a, b) => {
      const dateA = new Date(a.endDate || a.startDate || 0).getTime();
      const dateB = new Date(b.endDate || b.startDate || 0).getTime();
      return dateB - dateA;
    });
  }, [experiences, searchExperience]);

  const filteredEducations = useMemo(() => {
    if (!searchEducation) return educations;
    return educations.filter(edu =>
      edu.school?.toLowerCase().includes(searchEducation.toLowerCase()) ||
      edu.fieldOfStudy?.toLowerCase().includes(searchEducation.toLowerCase())
    );
  }, [educations, searchEducation]);

  const selectedProject = filteredProjects.find(p => p.id === selectedProjectId);
  const visibleProject = selectedProject || filteredProjects[0] || null;
  const visibleProjectIndex = visibleProject ? filteredProjects.findIndex((project) => project.id === visibleProject.id) : -1;

  useEffect(() => {
    if (filteredProjects.length === 0) return;
    if (!selectedProjectId || !filteredProjects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(filteredProjects[0].id);
    }
  }, [filteredProjects, selectedProjectId]);

  const goToPreviousProject = () => {
    if (expandedProjectList && visibleProjectIndex > 0) {
      setSelectedProjectId(filteredProjects[visibleProjectIndex - 1].id);
      return;
    }

    if (!expandedProjectList && currentPage > 1) {
      setCurrentPage((prev) => Math.max(1, prev - 1));
      setViewingFile(null);
      closeReportViewer();
    }
  };

  const goToNextProject = () => {
    if (expandedProjectList && visibleProjectIndex >= 0 && visibleProjectIndex < filteredProjects.length - 1) {
      setSelectedProjectId(filteredProjects[visibleProjectIndex + 1].id);
      return;
    }

    if (!expandedProjectList && hasMore) {
      setCurrentPage((prev) => prev + 1);
      setViewingFile(null);
      closeReportViewer();
    }
  };

  const toggleProject = (projectId: number) => {
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
      setShowDetailedInfo(null);
    } else {
      setSelectedProjectId(projectId);
      setShowDetailedInfo(null);
    }
  };

  const toggleDetails = (projectId: number) => {
    setShowDetailedInfo(showDetailedInfo === projectId ? null : projectId);
  };

  const closeReportViewer = () => {
    setViewingReport(null);
    setReportData(null);
  };

  const openReportCodeDialog = (project: any) => {
    if (!project?.id) return;

    if (hasAcceptedPaymentCode(project)) {
      void handleViewReport(project);
      return;
    }

    setPendingReportProject({
      id: project.id,
      name: project.name || "Untitled Project",
    });
    setReportCodeInput("");
    setReportCodeError("");
    setReportCodeVerified(false);
    setReportCodeDialogOpen(true);
  };

  const handleVerifyReportCode = async () => {
    if (!pendingReportProject?.id) return;

    setIsLoadingReport(true);
    try {
      const res = await apiFetch("/api/unique-codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: reportCodeInput.trim(),
          projectId: pendingReportProject.id,
        }),
      });

      if (res.ok) {
        setAcceptedPaymentCodeProjects((prev) => ({
          ...prev,
          [pendingReportProject.id]: true,
        }));
        setReportCodeError("");
        setReportCodeVerified(true);
      } else {
        setReportCodeVerified(false);
        const errorData = await res.text();
        setReportCodeError(errorData || "Invalid code");
      }
    } catch (error) {
      setReportCodeVerified(false);
      setReportCodeError("Error verifying code");
      console.error("Error verifying report code:", error);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleReportCodeSubmit = async () => {
    if (!pendingReportProject?.id || !reportCodeVerified) return;

    const project = pendingReportProject;
    setReportCodeDialogOpen(false);
    setReportCodeError("");
    setReportCodeVerified(false);
    setPendingReportProject(null);
    setReportCodeInput("");

    await handleViewReport({
      id: project.id,
      name: project.name,
    });
  };

  const toggleProjectFile = (project: any) => {
    if (!project?.id) return;

    if (viewingFile?.projectId === project.id) {
      setViewingFile(null);
      closeReportViewer();
      return;
    }

    const isExternalEvidence = Boolean(project.isExternalEvidenceLink);
    const evidenceUrl = project.fileUrl || (project.link ? normalizeExternalUrl(project.link) : null);
    if (!evidenceUrl) return;

    if (isExternalEvidence) {
      window.open(evidenceUrl, "_blank", "noopener,noreferrer");
      closeReportViewer();
      return;
    }

    setViewingFile({
      projectId: project.id,
      url: evidenceUrl,
      name: project.fileName || "Project Document",
      type: project.mimeType || (isPdfUrl(evidenceUrl) ? 'application/pdf' : 'application/octet-stream'),
    });
    closeReportViewer();
  };

  const handleReportAction = (project: any) => {
    if (hasAcceptedPaymentCode(project)) {
      void handleViewReport(project);
      return;
    }

    openReportCodeDialog(project);
  };

  const handleGenerateForensicReport = async (project: any) => {
    if (!project?.id || hasGeneratedForensicReport(project) || generatingForensicReports[project.id]) {
      return;
    }

    setGeneratingForensicReports((prev) => ({
      ...prev,
      [project.id]: true,
    }));

    let settled = false;
    const stopLoading = () => {
      setGeneratingForensicReports((prev) => {
        const next = { ...prev };
        delete next[project.id];
        return next;
      });
    };

    const fallbackTimer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      setGeneratedForensicReports((prev) => ({
        ...prev,
        [project.id]: true,
      }));
      stopLoading();
      toast({
        description: "your report will be available within 5 minutes",
      });
    }, 2000);

    try {
      const response = await apiFetch(`/api/projects/get-user-forensic/${project.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
        }),
      });

      if (settled) {
        return;
      }

      clearTimeout(fallbackTimer);
      const backendMessage = await getForensicReportResponseMessage(response);
      const toastMessage = backendMessage || "your report will be available within 5 minutes";

      settled = true;
      stopLoading();

      if (response.ok) {
        setGeneratedForensicReports((prev) => ({
          ...prev,
          [project.id]: true,
        }));
        toast({
          description: toastMessage,
        });
        return;
      }

      if (response.status === 400) {
        toast({
          description: backendMessage || "unable to start interview",
        });
        return;
      }

      console.error("Unable to start forensic report for project", project.id, response.status);
      toast({
        description: toastMessage,
        variant: "destructive",
      });
    } catch (error) {
      if (!settled) {
        clearTimeout(fallbackTimer);
        settled = true;
        stopLoading();
        console.error("Error generating forensic report:", error);
        toast({
          description: "your report will be available within 5 minutes",
        });
      }
    } finally {
      clearTimeout(fallbackTimer);
      if (!settled) {
        settled = true;
        stopLoading();
      }
    }
  };

  const handleGenerateLink = async () => {
    if (!user?.id) {
      toast({
        title: "Unable to generate link",
        description: "Please sign in again and try once more.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingShareLink(true);
    setShareLink("");

    try {
      const createResponse = await apiFetch("/api/users/share-portfolio", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text().catch(() => "");
        throw new Error(errorText || "Failed to create share link");
      }

      const createdPayload = (await createResponse.json().catch(() => null)) as SharePortfolioResponse | null;
      const generatedLink = createdPayload?.link;

      if (!generatedLink) {
        throw new Error("Share link was not returned by the server");
      }

      const token = (() => {
        try {
          return new URL(generatedLink, typeof window !== "undefined" ? window.location.origin : undefined)
            .pathname
            .split("/")
            .filter(Boolean)
            .pop() || "";
        } catch {
          return generatedLink.split("?")[0].split("/").filter(Boolean).pop() || "";
        }
      })();

      if (!token) {
        throw new Error("Share link token could not be parsed");
      }

      const publicShareLink = typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname.startsWith("/forensic-app") ? "/forensic-app" : ""}/portfolio/shared/${token}`
        : generatedLink;

      setShareLink(publicShareLink);

      toast({
        title: "Link Generated!",
        description: "Your share link is ready.",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error generating share link:", error);
      toast({
        title: "Unable to generate link",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingShareLink(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "PDF portfolio link copied to clipboard.",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim() || !selectedCountry) return;

    setIsSubmittingFeedback(true);
    try {
      const response = await apiFetch("api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: parseInt(selectedCountry, 10),
          message: feedbackText.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Feedback Sent",
          description: "Thank you for helping us improve SkillGo!",
        });
        setFeedbackText("");
        setSelectedCountry("");
        setShowFeedback(false);
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 font-poppins overflow-x-hidden">
      <div className="flex items-center gap-4 mb-2 -ml-2">
        <BackButton fallbackPath="/forensic-app" />
      </div>
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <Dialog
          open={reportCodeDialogOpen}
          onOpenChange={(open) => {
            setReportCodeDialogOpen(open);
            if (!open) {
              setPendingReportProject(null);
              setReportCodeInput("");
              setReportCodeError("");
              setReportCodeVerified(false);
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Payment code</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Textarea
                  id="payment-code"
                  value={reportCodeInput}
                  onChange={(e) => {
                    setReportCodeInput(e.target.value);
                    if (reportCodeError) setReportCodeError("");
                    if (reportCodeVerified) setReportCodeVerified(false);
                  }}
                  rows={1}
                  placeholder="Enter here"
                  className="mx-auto w-full max-w-[11rem] min-h-[44px] resize-none text-center font-mono tracking-widest"
                />
                {reportCodeError && <p className="text-xs font-semibold text-red-600">{reportCodeError}</p>}
                {reportCodeVerified && <p className="text-xs font-semibold text-emerald-600">Code accepted</p>}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReportCodeDialogOpen(false)}
                >
                  Cancel
                </Button>
                {!reportCodeVerified ? (
                  <Button type="button" onClick={handleVerifyReportCode} disabled={isLoadingReport}>
                    {isLoadingReport ? "Verifying..." : "Verify"}
                  </Button>
                ) : (
                  <Button type="button" onClick={() => void handleReportCodeSubmit()}>
                    my verified skills
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className="space-y-2">
          {/* Filter and Project List Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-6 w-full">
              <div
                className="flex items-center gap-2 cursor-pointer group shrink-0"
                onClick={() => {
                  setCurrentTab("projects");
                  fetchProjects(currentPage, pageSize);
                }}
              >
                <Briefcase className={`h-6 w-6 transition-colors ${currentTab === "projects" ? "text-logo-gold" : "text-slate-400 group-hover:text-logo-gold"}`} />
                <h2 className={`text-base font-semibold transition-colors font-poppins ${currentTab === "projects" ? "text-logo-blue" : "text-slate-500 group-hover:text-logo-blue"}`}>
                  My Projects
                </h2>
              </div>

              <div className="flex-1 flex justify-center w-full">
                <TabsList className="bg-slate-50/50 p-1 border border-slate-100 rounded-xl h-auto flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <TabsTrigger
                    value="experience"
                    className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-logo-gold data-[state=active]:shadow-sm rounded-lg transition-all h-10 px-4 w-full sm:w-auto"
                  >
                    Experience
                  </TabsTrigger>
                  <TabsTrigger
                    value="education"
                    className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-logo-gold data-[state=active]:shadow-sm rounded-lg transition-all h-10 px-4 w-full sm:w-auto"
                  >
                    Education
                  </TabsTrigger>
                  <TabsTrigger
                    value="share"
                    className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-logo-gold data-[state=active]:shadow-sm rounded-lg transition-all h-10 px-4 w-full sm:w-auto"
                  >
                    Share
                  </TabsTrigger>
                  <TabsTrigger
                    value="feedback"
                    className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-logo-gold data-[state=active]:shadow-sm rounded-lg transition-all h-10 px-4 w-full sm:w-auto"
                  >
                    Give Feedback
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="w-full md:w-48 shrink-0">
                {(currentTab === "projects" || currentTab === "experience" || currentTab === "education") && (
                  <div className="relative animate-in fade-in duration-300">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Filter by name..."
                      value={
                        currentTab === "projects" ? searchName :
                        currentTab === "experience" ? searchExperience :
                        searchEducation
                      }
                      onChange={(e) => {
                        if (currentTab === "projects") setSearchName(e.target.value);
                        else if (currentTab === "experience") setSearchExperience(e.target.value);
                        else if (currentTab === "education") setSearchEducation(e.target.value);
                      }}
                      className="pl-10 text-sm font-semibold"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <TabsContent value="projects" className="mt-0 space-y-0 animate-in fade-in duration-300">
            {loadingProjects ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-logo-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/30 border-2 border-dashed border-slate-100 rounded-3xl mx-auto w-full">
                <Briefcase className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                <h3 className="text-logo-blue font-bold mb-1">No projects found</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  {searchName ? `No projects found matching "${searchName}".` : "Start your journey by adding your first project in the Workbench."}
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Project Navigation */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center pb-4 px-4 md:px-0 border-b-2 border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingProjects || (expandedProjectList ? visibleProjectIndex <= 0 : currentPage <= 1)}
                    onClick={goToPreviousProject}
                    className="h-10 sm:h-9 px-4 sm:px-4 rounded-lg sm:rounded-xl text-sm sm:text-sm font-bold text-slate-700 hover:text-logo-gold hover:border-logo-gold border-2 w-full sm:w-auto transition-all"
                  >
                    <span className="hidden sm:inline">← Previous</span>
                    <span className="sm:hidden">← Previous</span>
                  </Button>
                  <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap text-center">
                    {expandedProjectList && visibleProject ? `Project ${visibleProjectIndex + 1} of ${filteredProjects.length}` : `Page ${currentPage}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingProjects || (expandedProjectList ? visibleProjectIndex >= filteredProjects.length - 1 : !hasMore)}
                    onClick={goToNextProject}
                    className="h-10 sm:h-9 px-4 sm:px-4 rounded-lg sm:rounded-xl text-sm sm:text-sm font-bold text-slate-700 hover:text-logo-gold hover:border-logo-gold border-2 w-full sm:w-auto transition-all"
                  >
                    <span className="hidden sm:inline">Next →</span>
                    <span className="sm:hidden">Next →</span>
                  </Button>
                </div>

                <div className="flex justify-center w-full pb-3">
                  {visibleProject && (
                    <Card
                      key={visibleProject.id}
                      className={`w-[min(100%,34rem)] xl:w-[min(100%,40rem)] border-slate-100 shadow-md hover:shadow-lg transition-all duration-300 bg-white rounded-3xl md:overflow-hidden overflow-visible group ${selectedProjectId === visibleProject.id ? "ring-2 ring-logo-gold border-logo-gold shadow-xl shadow-logo-gold/10" : ""}`}
                    >
                      <CardContent className="p-5 sm:p-8">
                        <div className="space-y-3">
                          {/* Project Name */}
                          <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-center sm:text-left">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide sm:w-24 shrink-0">Name:</span>
                            <h3 className="text-sm font-bold text-logo-blue">
                              {visibleProject.name || "Untitled Project"}
                            </h3>
                          </div>

                          {/* Duration */}
                          <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-center sm:text-left">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide sm:w-24 shrink-0">Duration:</span>
                            <p className="text-sm font-semibold text-slate-800">
                              {visibleProject.duration || "Not specified"}
                            </p>
                          </div>

                          {/* Goal */}
                          <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-center sm:text-left">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide sm:w-24 shrink-0">Goal:</span>
                            <p className="text-sm font-semibold text-slate-700">
                              {visibleProject.goal || "Not specified"}
                            </p>
                          </div>

                          {/* Link */}
                          <div className="flex flex-col sm:flex-row sm:gap-4 gap-1 text-center sm:text-left">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide sm:w-24 shrink-0">Link:</span>
                            {visibleProject.link ? (
                              <a
                                href={normalizeExternalUrl(visibleProject.link) || visibleProject.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-logo-gold hover:text-logo-gold/80 hover:underline cursor-pointer break-all"
                                title={visibleProject.link}
                              >
                                {visibleProject.link}
                              </a>
                            ) : (
                              <p className="text-sm font-semibold text-slate-400">No external link provided</p>
                            )}
                          </div>

                          {!hasGeneratedForensicReport(visibleProject) && (
                            <div className="flex flex-col sm:flex-row sm:gap-4 gap-3 text-center sm:text-left">
                              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide sm:w-24 shrink-0">Actions:</span>
                              <Button
                                onClick={() => void handleGenerateForensicReport(visibleProject)}
                                variant="outline"
                                size="sm"
                                disabled={generatingForensicReports[visibleProject.id] === true}
                                className="flex items-center gap-2 h-10 px-4 border-logo-gold/30 bg-logo-gold/5 hover:bg-logo-gold/10 hover:border-logo-gold text-logo-gold font-semibold whitespace-nowrap w-full md:w-auto disabled:opacity-70"
                                title="Generate forensic report"
                              >
                                {generatingForensicReports[visibleProject.id] ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Generating...</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-4 w-4" />
                                    <span>skills report</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {/* Asset/Evidence */}
                          {visibleProject.fileUrl && (
                            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:items-start">
                              <div className="flex flex-col md:flex-row md:gap-4 gap-3 md:items-center justify-center sm:justify-start">
                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide md:w-24 shrink-0 text-center sm:text-left">Asset/Evidence:</span>
                                <Button
                                  onClick={() => toggleProjectFile(visibleProject)}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2 h-10 px-4 border-logo-gold/30 bg-logo-gold/5 hover:bg-logo-gold/10 hover:border-logo-gold text-logo-gold font-semibold whitespace-nowrap w-full md:w-auto"
                                  title={visibleProject.fileUrl || visibleProject.link || "Evidence"}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>{visibleProject.fileUrl && (visibleProject.mimeType?.toLowerCase().includes('pdf') || isPdfUrl(visibleProject.fileUrl)) ? "View Evidence/Document" : "Open Evidence Link"}</span>
                                </Button>
                                {viewingFile?.projectId === visibleProject.id && (
                                  viewingReport?.projectId === visibleProject.id ? (
                                    <Button
                                      onClick={closeReportViewer}
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-2 h-10 px-4 border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-700 font-semibold whitespace-nowrap w-full md:w-auto"
                                      title="Hide report"
                                    >
                                      <X className="h-4 w-4" />
                                      <span>Hide Report</span>
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => handleReportAction(visibleProject)}
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-2 h-10 px-4 border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-700 font-semibold whitespace-nowrap w-full md:w-auto"
                                      title="my verified skills"
                                    >
                                      <MessageSquare className="h-4 w-4" />
                                      <span>my verified skills</span>
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Inline image preview - Removed as per user request to only load on click */}
                      </CardContent>
                    </Card>
                  )}
                </div>

              </div>
            )}
          </TabsContent>

          <TabsContent value="experience" className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {loadingExp ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-logo-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredExperiences.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-8">{searchExperience ? `No experience records matching "${searchExperience}".` : "No experience records found."}</p>
            ) : (
              <div className="w-full">
                <div className="flex flex-wrap gap-4 w-full">
                  {filteredExperiences.map((exp) => (
                  <Card key={exp.id} className="border-slate-100 shadow-sm hover:border-slate-200 transition-colors w-full">
                    <CardHeader className="pb-2 pt-4 px-4 flex flex-col items-center sm:items-start text-center sm:text-left">
                      <div className="flex flex-col items-center sm:items-start justify-center sm:justify-start">
                        <CardTitle className="text-sm font-semibold text-slate-900 mb-1">{exp.role}</CardTitle>
                        <span className="text-sm font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full mb-1">
                          {exp.startDate ? new Date(exp.startDate).getFullYear() : ""} — {exp.endDate ? new Date(exp.endDate).getFullYear() : ""}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-logo-gold">{exp.company}</p>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-sm text-slate-600 leading-relaxed text-center sm:text-left">{exp.description}</p>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="education" className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {loadingEducation ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-logo-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredEducations.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-8">{searchEducation ? `No education records matching "${searchEducation}".` : "No education records found."}</p>
            ) : (
              <div className="w-full">
                <div className="flex flex-wrap gap-4 w-full">
                  {filteredEducations.map((edu) => (
                  <Card key={edu.id} className="border-slate-100 shadow-sm hover:border-slate-200 transition-colors w-full">
                    <CardHeader className="pb-2 pt-4 px-4 flex flex-col items-center sm:items-start text-center sm:text-left">
                      <div className="flex flex-col items-center sm:items-start justify-center sm:justify-start">
                        <CardTitle className="text-sm font-semibold text-slate-900 mb-1">{edu.educationLevel}</CardTitle>
                        <span className="text-sm font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full mb-1">
                          {edu.startDate ? new Date(edu.startDate).getFullYear() : ""} — {edu.endDate ? new Date(edu.endDate).getFullYear() : ""}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-logo-gold">{edu.school}</p>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <p className="text-sm text-slate-600 leading-relaxed text-center sm:text-left">{edu.fieldOfStudy}</p>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="share" className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
            <div className="w-full space-y-6">
              <Card className="border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="items-center text-center pb-2 pt-8 px-8">
                  <div className="space-y-2 max-w-2xl">
                    <CardTitle className="text-lg font-semibold text-slate-900">SkillGo shared portfolio</CardTitle>
                    <p className="text-base font-medium text-logo-blue">Beyond the CV: Candidate Verified Evidence</p>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center p-8 space-y-6">
                  <div className="w-full max-w-3xl grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-center shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Education</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">2</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-center shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Experience</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">2</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-center shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Projects</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">1</p>
                    </div>
                    <div className="rounded-2xl border border-logo-gold/20 bg-logo-gold/[0.08] px-4 py-3 text-center shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Readiness</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">High Risk Hire</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-full">
                    <Share2 className="h-12 w-12 text-blue-900" />
                  </div>

                  {!shareLink ? (
                    <Button
                      onClick={() => void handleGenerateLink()}
                      disabled={isGeneratingShareLink}
                      className="bg-logo-gold hover:bg-logo-gold/90 px-8 py-6 text-base font-semibold disabled:opacity-70"
                    >
                      {isGeneratingShareLink ? "Generating..." : "Generate Share Link"}
                    </Button>
                  ) : (
                    <div className="w-full max-w-md space-y-4 animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <Input
                          readOnly
                          value={shareLink}
                          className="bg-transparent border-none focus-visible:ring-0 h-8 text-sm text-slate-600 font-medium"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyLink}
                          className="h-8 w-8 p-0 text-slate-900 hover:text-blue-900 hover:bg-blue-900/5"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-wider">
                        Link is active and ready to share
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full">
            <div className="w-full space-y-6">
              {/* Feedback Section */}
              <div className="flex flex-col items-center">
                <Card className="w-full border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-logo-blue flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-900" />
                      We Value Your Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="space-y-2">
                      <Label htmlFor="country-select">
                        Your Country
                      </Label>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger id="country-select">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.id} value={country.id}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback-message">
                        Your Message
                      </Label>
                      <Textarea
                        id="feedback-message"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Please provide your feedback here..."
                        className="min-h-[120px] resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setCurrentTab("projects")}
                        disabled={isSubmittingFeedback}
                        className="font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleFeedbackSubmit}
                        disabled={!feedbackText.trim() || !selectedCountry || isSubmittingFeedback}
                        className="bg-logo-gold hover:bg-logo-gold/90 font-bold px-8"
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : "Submit Feedback"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Document and report viewers */}
      {(viewingFile || viewingReport) && (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)] items-start">
          {viewingFile && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 w-full">
              <Card className="border-logo-gold/15 shadow-md shadow-logo-gold/10 bg-white rounded-3xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-blue-900 flex-shrink-0" />
                    <span className="text-sm font-black text-slate-900 truncate">
                      {viewingFile.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setViewingFile(null);
                      closeReportViewer();
                    }}
                    className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0 ml-4"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </Button>
                </div>

                <CardContent className="p-6 bg-slate-50 h-[60vh] overflow-auto flex flex-col">
                  {isLoadingFile && (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className="w-8 h-8 border-3 border-logo-gold border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-500 font-bold text-xs md:text-sm mt-2 animate-pulse">Loading document...</p>
                    </div>
                  )}

                  {!isLoadingFile && fileBlob && (
                    (() => {
                      const mimeType = fileBlob.type || viewingFile.type || "";
                      const isPdf = mimeType === "application/pdf";
                      const isImage = mimeType.startsWith("image/");

                      if (isPdf && pdfArrayBuffer) {
                        return (
                          <SimplePDFViewer
                            data={pdfArrayBuffer}
                            fileName={viewingFile.name}
                          />
                        );
                      } else if (isPdf && !pdfArrayBuffer) {
                        return (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                              <p className="text-slate-500 font-bold text-sm">Loading PDF...</p>
                            </div>
                          </div>
                        );
                      } else if (isImage) {
                        return (
                          <div className="flex items-center justify-center h-full">
                            {fileBlobUrl && (
                              <img
                                src={fileBlobUrl}
                                alt={viewingFile.name}
                                className="max-w-full max-h-full object-contain shadow-md rounded-lg"
                              />
                            )}
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                              <p className="text-slate-500 font-bold text-sm">Unsupported file type</p>
                              <p className="text-slate-400 text-xs mt-2">This file type cannot be previewed</p>
                            </div>
                          </div>
                        );
                      }
                    })()
                  )}

                  {!isLoadingFile && !fileBlobUrl && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileText className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold text-sm">Couldn't load file</p>
                        <p className="text-slate-400 text-xs mt-2">Failed to fetch the file. Please try again.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {viewingReport && (
            <div className={`animate-in fade-in slide-in-from-top-4 duration-300 w-full ${!viewingFile ? "xl:col-span-2" : ""}`}>
              <Card className="border-logo-gold/15 shadow-md shadow-logo-gold/10 bg-white rounded-3xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-blue-900 flex-shrink-0" />
                    <span className="text-sm font-black text-slate-900 truncate">
                      {viewingReport.projectName || "Project report"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeReportViewer}
                    className="h-9 w-9 p-0 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0 ml-4"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </Button>
                </div>

                <CardContent className="p-6 bg-gradient-to-br from-logo-blue/5 via-white to-logo-gold/5 h-[60vh] overflow-auto flex flex-col">
                  {isLoadingReport ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className="w-8 h-8 border-3 border-logo-gold border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-500 font-bold text-xs md:text-sm mt-2 animate-pulse">Loading report...</p>
                    </div>
                  ) : reportData ? (
                    <div className="w-full min-w-0 max-w-full space-y-4 pr-1 text-center">
                      <div className="rounded-2xl border border-logo-blue/10 bg-white/90 p-4 shadow-sm shadow-logo-blue/5">
                        <div className="grid gap-3 md:grid-cols-3 justify-items-center">
                          {REPORT_PATH_DESCRIPTIONS.map((path) => (
                            <div key={path.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center">
                              <p className="text-sm font-bold text-slate-900">{path.title}</p>
                              <p className="mt-2 text-sm leading-relaxed text-slate-600">{path.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-logo-gold/15 bg-gradient-to-r from-logo-blue/5 via-white to-logo-gold/5 p-5 shadow-sm shadow-logo-gold/5 space-y-4 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div>
                            <h3 className="text-lg font-black text-logo-blue">My thought process</h3>
                            <p className="mt-1 text-sm font-semibold text-slate-500">{viewingReport.projectName || "Project report"}</p>
                          </div>
                          {typeof reportData === "object" && reportData !== null && !Array.isArray(reportData) && (
                            <div className="flex flex-wrap justify-center gap-2">
                              {(["score", "status", "rating", "overall"] as const)
                                .map((key) => {
                                  const value = reportData[key];
                                  if (value === undefined || value === null || value === "") return null;
                                  return (
                                    <span key={key} className="rounded-full bg-logo-gold/10 px-3 py-1 text-xs font-bold text-logo-blue ring-1 ring-logo-gold/10">
                                      {formatReportLabel(key)}: {String(value)}
                                    </span>
                                  );
                                })
                                .filter(Boolean)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-logo-blue/10 bg-white p-5 shadow-sm shadow-logo-blue/5 text-center overflow-hidden">
                        {renderReportValue(reportData)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileText className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold text-sm">No report generated yet</p>
                        <p className="text-slate-400 text-xs mt-2">This project does not have a report yet. Use View Report to check again later.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Portfolio;
