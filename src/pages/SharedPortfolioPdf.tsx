import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimplePDFViewer } from "@/components/SimplePDFViewer";
import { apiFetch } from "@/lib/api";

type SharedEducation = {
  educationLevel?: string | number;
  school?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
};

type SharedWorkExperience = {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

type Evaluation = {
  label?: string;
  question?: string;
  candidateAnswer?: string;
  grade?: string;
  justification?: string;
};

type CandidateSummary = {
  readiness?: string;
  aiMaturity?: string;
  finalJustification?: string;
};

type ProjectAiResult = {
  header?: {
    pathChosen?: string;
  };
  evaluations?: Evaluation[];
  candidateSummary?: CandidateSummary;
};

type ProjectFeedback = {
  interviewSessionId?: number;
  aiResult?: ProjectAiResult;
  candidateSummary?: CandidateSummary;
  signalBreakdown?: unknown;
  governanceOk?: boolean;
  genericPenalty?: boolean;
  penaltyApplied?: string;
};

type SharedProject = {
  projectId?: string | number;
  name?: string;
  duration?: string;
  goal?: string;
  link?: string | null;
  fileUrl?: string | null;
  imageURL?: string | null;
  fileName?: string | null;
  storedFileName?: string | null;
  mimeType?: string | null;
  isExternalEvidenceLink?: boolean;
  projectFeedback?: ProjectFeedback | null;
};

type SharedPortfolioData = {
  portfolioOwnerId?: string;
  portfolioOwnerName?: string;
  userEducations?: SharedEducation[];
  userWorkExperiences?: SharedWorkExperience[];
  userProjects?: SharedProject[];
};

type PortfolioSummary = {
  educationCount: number;
  experienceCount: number;
  projectCount: number;
  readiness?: string;
  maturity?: string;
  projectJustification?: string;
};

const EXTERNAL_LINK_MIME_TYPE = "text/uri-list";

const normalizeApiValue = (value: unknown) => {
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

const normalizeExternalUrl = (value: unknown) => {
  const url = normalizeApiValue(value);
  if (typeof url !== "string") return null;

  if (/^[a-z][a-z\d+\-.]*:/i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/") || url.startsWith(".") || url.startsWith("#")) return url;
  if (/^[^\s/?#]+\.[^\s/?#]+(?:[/?#].*)?$/i.test(url)) return `https://${url}`;

  return url;
};

const normalizeBoolean = (value: unknown) => {
  if (value === true) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

const findProp = (obj: any, target: string): any => {
  if (!obj || typeof obj !== "object") return null;

  const targetLower = target.toLowerCase();
  const exactValue = normalizeApiValue(obj[target]);
  if (exactValue !== null) return exactValue;

  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === targetLower) {
      const matchedValue = normalizeApiValue(obj[key]);
      if (matchedValue !== null) return matchedValue;
    }
  }

  if (obj.project && typeof obj.project === "object") {
    const nested = findProp(obj.project, target);
    if (nested !== null) return nested;
  }

  if (obj.data && typeof obj.data === "object") {
    const nested = findProp(obj.data, target);
    if (nested !== null) return nested;
  }

  return null;
};

const buildExternalLinkEvidence = (linkValue: unknown) => {
  const link = normalizeApiValue(linkValue);
  const normalizedLink = normalizeExternalUrl(link);
  if (typeof link !== "string") return null;

  try {
    const parsedUrl = new URL(normalizedLink || link);
    const host = parsedUrl.hostname.replace(/^www\./i, "");
    const label = host ? `${host} link` : "External evidence link";

    return {
      fileUrl: normalizedLink || link,
      fileName: label,
      storedFileName: label,
      mimeType: EXTERNAL_LINK_MIME_TYPE,
      isExternalEvidenceLink: true,
    };
  } catch {
    return {
      fileUrl: normalizedLink || link,
      fileName: "External evidence link",
      storedFileName: "External evidence link",
      mimeType: EXTERNAL_LINK_MIME_TYPE,
      isExternalEvidenceLink: true,
    };
  }
};

const normalizeCandidateSummary = (value: any): CandidateSummary | undefined => {
  if (!value || typeof value !== "object") return undefined;

  return {
    readiness: typeof findProp(value, "readiness") === "string" ? String(findProp(value, "readiness")) : undefined,
    aiMaturity: typeof findProp(value, "aiMaturity") === "string" ? String(findProp(value, "aiMaturity")) : undefined,
    finalJustification:
      typeof findProp(value, "finalJustification") === "string" ? String(findProp(value, "finalJustification")) : undefined,
  };
};

const normalizeProjectFeedback = (value: any): ProjectFeedback | null => {
  if (!value || typeof value !== "object") return null;

  const aiResult = findProp(value, "aiResult") || findProp(value, "AiResult");
  const candidateSummary = normalizeCandidateSummary(
    findProp(value, "candidateSummary") || findProp(value, "CandidateSummary") || findProp(aiResult, "candidateSummary")
  );
  const interviewSessionId = findProp(value, "interviewSessionId") || findProp(value, "InterviewSessionId");
  const signalBreakdown = findProp(value, "signalBreakdown") || findProp(value, "SignalBreakdown");
  const governanceOk = findProp(value, "governance_ok") ?? findProp(value, "governanceOk");
  const genericPenalty = findProp(value, "generic_penalty") ?? findProp(value, "genericPenalty");
  const penaltyApplied = findProp(value, "penalty_applied") || findProp(value, "penaltyApplied");

  return {
    interviewSessionId: typeof interviewSessionId === "number" ? interviewSessionId : undefined,
    aiResult: aiResult && typeof aiResult === "object"
      ? {
          ...(aiResult as ProjectAiResult),
          candidateSummary: normalizeCandidateSummary(findProp(aiResult, "candidateSummary")) || candidateSummary,
        }
      : undefined,
    candidateSummary,
    signalBreakdown,
    governanceOk: typeof governanceOk === "boolean" ? governanceOk : undefined,
    genericPenalty: typeof genericPenalty === "boolean" ? genericPenalty : undefined,
    penaltyApplied: typeof penaltyApplied === "string" ? penaltyApplied : undefined,
  };
};

const normalizeSharedProject = (project: any): SharedProject => {
  const mime =
    findProp(project, "mimeType") ||
    findProp(project, "contentType") ||
    findProp(project, "mime_type") ||
    findProp(project, "content_type") ||
    findProp(project, "MimeType") ||
    findProp(project, "ContentType");
  const url =
    findProp(project, "fileUrl") ||
    findProp(project, "imageURL") ||
    findProp(project, "url") ||
    findProp(project, "file_url") ||
    findProp(project, "FileUrl") ||
    findProp(project, "ImageURL");
  const fileName =
    findProp(project, "fileName") ||
    findProp(project, "originalFileName") ||
    findProp(project, "originalName") ||
    findProp(project, "imageFilename") ||
    findProp(project, "file_name") ||
    findProp(project, "name_original") ||
    findProp(project, "FileName") ||
    findProp(project, "OriginalFileName");
  const name = findProp(project, "name") || findProp(project, "projectName") || findProp(project, "ProjectName") || findProp(project, "Name");
  const goal = findProp(project, "goal") || findProp(project, "Goal") || findProp(project, "projectGoal");
  const duration = findProp(project, "duration") || findProp(project, "Duration");
  const link = findProp(project, "link") || findProp(project, "Link");
  const storedFileName = findProp(project, "storedFileName") || findProp(project, "StoredFileName") || findProp(project, "stored_file_name");
  const projectId = findProp(project, "projectId") || findProp(project, "ProjectId") || findProp(project, "id");
  const feedback = normalizeProjectFeedback(findProp(project, "projectFeedback") || findProp(project, "ProjectFeedback"));
  const derivedEvidence = !url && link ? buildExternalLinkEvidence(link) : null;

  const finalFileName =
    fileName ||
    (url && !String(url).endsWith("/") && !String(url).endsWith("/file") ? String(url).split("/").pop() : null) ||
    derivedEvidence?.fileName ||
    null;

  return {
    projectId: typeof projectId === "string" || typeof projectId === "number" ? projectId : undefined,
    name: typeof name === "string" ? name : undefined,
    duration: typeof duration === "string" ? duration : undefined,
    goal: typeof goal === "string" ? goal : undefined,
    link: typeof link === "string" ? link : null,
    imageURL: typeof (url || derivedEvidence?.fileUrl) === "string" ? String(url || derivedEvidence?.fileUrl) : null,
    fileName: typeof finalFileName === "string" ? finalFileName : null,
    storedFileName: typeof (storedFileName || fileName || derivedEvidence?.storedFileName) === "string"
      ? String(storedFileName || fileName || derivedEvidence?.storedFileName)
      : null,
    mimeType: typeof (mime || derivedEvidence?.mimeType) === "string" ? String(mime || derivedEvidence?.mimeType) : null,
    fileUrl: typeof (url || derivedEvidence?.fileUrl) === "string" ? String(url || derivedEvidence?.fileUrl) : null,
    isExternalEvidenceLink: derivedEvidence?.isExternalEvidenceLink === true || normalizeBoolean(findProp(project, "isExternalEvidenceLink")),
    projectFeedback: feedback,
  };
};

const normalizeSharedEducation = (education: any): SharedEducation => ({
  educationLevel: findProp(education, "educationLevel") || findProp(education, "EducationLevel") || undefined,
  school: findProp(education, "school") || findProp(education, "School") || undefined,
  fieldOfStudy: findProp(education, "fieldOfStudy") || findProp(education, "FieldOfStudy") || undefined,
  startDate: findProp(education, "startDate") || findProp(education, "StartDate") || undefined,
  endDate: findProp(education, "endDate") || findProp(education, "EndDate") || undefined,
});

const normalizeSharedWorkExperience = (experience: any): SharedWorkExperience => ({
  company: findProp(experience, "company") || findProp(experience, "Company") || undefined,
  role: findProp(experience, "role") || findProp(experience, "Role") || undefined,
  startDate: findProp(experience, "startDate") || findProp(experience, "StartDate") || undefined,
  endDate: findProp(experience, "endDate") || findProp(experience, "EndDate") || undefined,
  description: findProp(experience, "description") || findProp(experience, "Description") || undefined,
});

const normalizeSharedPortfolio = (portfolio: any): SharedPortfolioData => {
  const projects = findProp(portfolio, "userProjects");
  const educations = findProp(portfolio, "userEducations");
  const experiences = findProp(portfolio, "userWorkExperiences");
  const portfolioOwnerId = findProp(portfolio, "portfolioOwnerId") || findProp(portfolio, "PortfolioOwnerId");
  const portfolioOwnerName =
    findProp(portfolio, "portfolioOwnerName") ||
    findProp(portfolio, "PortfolioOwnerName") ||
    findProp(portfolio, "fullName") ||
    findProp(portfolio, "FullName");

  return {
    portfolioOwnerId: typeof portfolioOwnerId === "string" ? portfolioOwnerId : undefined,
    portfolioOwnerName: typeof portfolioOwnerName === "string" ? portfolioOwnerName : undefined,
    userProjects: Array.isArray(projects) ? projects.map(normalizeSharedProject) : [],
    userEducations: Array.isArray(educations) ? educations.map(normalizeSharedEducation) : [],
    userWorkExperiences: Array.isArray(experiences) ? experiences.map(normalizeSharedWorkExperience) : [],
  };
};

const safeText = (value: unknown, fallback = "Not provided") => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (typeof value === "number") return String(value);

  return fallback;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatRange = (start?: string, end?: string) => {
  const startText = formatDate(start);
  const endText = formatDate(end);
  if (startText && endText) return `${startText} - ${endText}`;
  return startText || endText || "Dates not provided";
};

const getEducationLevelText = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return "Education level not provided";
  return typeof value === "number" ? `Level ${value}` : String(value);
};

const getGradeTone = (grade?: string) => {
  const normalized = String(grade || "").toLowerCase();
  if (normalized.includes("excellent") || normalized.includes("strong") || normalized.includes("good")) return "success";
  if (normalized.includes("need") || normalized.includes("fair")) return "warning";
  if (normalized.includes("unsatisfactory") || normalized.includes("poor") || normalized.includes("risk")) return "danger";
  return "default";
};

const getProjectEvidenceSource = (project?: SharedProject | null) => {
  if (!project) return "";
  return normalizeExternalUrl(project.fileUrl || project.link || "") || "";
};

const getProjectEvidenceName = (project?: SharedProject | null) => {
  if (!project) return "Evidence document";
  return project.fileName || project.storedFileName || project.fileUrl || project.link || "Evidence document";
};

const getProjectEvidenceMimeType = (project?: SharedProject | null) => {
  if (!project) return "";
  if (project.mimeType) return project.mimeType;

  const source = getProjectEvidenceSource(project).toLowerCase();
  if (source.endsWith(".pdf")) return "application/pdf";
  if (source.endsWith(".png")) return "image/png";
  if (source.endsWith(".gif")) return "image/gif";
  if (source.endsWith(".webp")) return "image/webp";
  if (source.endsWith(".bmp")) return "image/bmp";
  if (source.endsWith(".jpg") || source.endsWith(".jpeg")) return "image/jpeg";
  return "";
};

const isExternalEvidenceUrl = (project?: SharedProject | null) => {
  if (!project) return false;
  return project.isExternalEvidenceLink || project.mimeType === EXTERNAL_LINK_MIME_TYPE;
};

const getProjectCandidateSummary = (project?: SharedProject | null) => {
  if (!project?.projectFeedback) return undefined;
  return project.projectFeedback.candidateSummary || project.projectFeedback.aiResult?.candidateSummary;
};

const getSummary = (portfolio: SharedPortfolioData): PortfolioSummary => {
  const projects = portfolio.userProjects ?? [];
  const summary = projects.map((project) => getProjectCandidateSummary(project)).find(Boolean);

  return {
    educationCount: portfolio.userEducations?.length ?? 0,
    experienceCount: portfolio.userWorkExperiences?.length ?? 0,
    projectCount: projects.length,
    readiness: summary?.readiness,
    maturity: summary?.aiMaturity,
    projectJustification: summary?.finalJustification,
  };
};

const SharedPortfolioPdf = () => {
  const { token } = useParams<{ token: string }>();
  const [portfolio, setPortfolio] = useState<SharedPortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const [isEvaluationWalkthroughOpen, setIsEvaluationWalkthroughOpen] = useState(false);
  const [evidenceArrayBuffer, setEvidenceArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [evidenceBlobUrl, setEvidenceBlobUrl] = useState("");
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadPortfolio = async () => {
      if (!token) {
        setError("Invalid token");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await apiFetch(`/api/users/portfolio/${token}`, {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache, no-store, max-age=0",
            Pragma: "no-cache",
          },
        });

        if (!response.ok) {
          const message = (await response.text().catch(() => "")).trim().toLowerCase();
          if (
            response.status === 400 ||
            response.status === 401 ||
            response.status === 403 ||
            response.status === 404 ||
            message.includes("invalid token")
          ) {
            throw new Error("Invalid token");
          }

          throw new Error(message || "Unable to open this shared portfolio.");
        }

        const payload = await response.json().catch(() => null);
        const rawSharedPortfolio = (payload?.data ?? payload) as SharedPortfolioData | null;

        if (!rawSharedPortfolio || typeof rawSharedPortfolio !== "object") {
          throw new Error("The shared portfolio response was empty.");
        }

        const sharedPortfolio = normalizeSharedPortfolio(rawSharedPortfolio);

        if (!mounted) return;
        setPortfolio(sharedPortfolio);
        document.title = "Beyond the CV: Candidate Verified Evidence";
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to open this shared portfolio.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadPortfolio();

    return () => {
      mounted = false;
    };
  }, [token]);

  const summary = useMemo(() => (portfolio ? getSummary(portfolio) : null), [portfolio]);
  const projects = portfolio?.userProjects ?? [];

  useEffect(() => {
    if (!projects.length) {
      if (selectedProjectIndex !== null) {
        setSelectedProjectIndex(null);
      }
      setIsEvaluationWalkthroughOpen(false);
      return;
    }

    if (selectedProjectIndex === null || selectedProjectIndex >= projects.length) {
      setSelectedProjectIndex(0);
    }
  }, [projects.length, selectedProjectIndex]);

  const selectedProject = selectedProjectIndex !== null ? projects[selectedProjectIndex] ?? null : null;
  const selectedProjectResult = selectedProject?.projectFeedback?.aiResult ?? null;
  const selectedProjectPathChosen = selectedProjectResult?.header?.pathChosen;
  const selectedProjectEvaluations = selectedProjectResult?.evaluations ?? [];
  const selectedProjectEvidenceUrl = getProjectEvidenceSource(selectedProject);
  const selectedProjectEvidenceName = getProjectEvidenceName(selectedProject);
  const selectedProjectEvidenceMimeType = getProjectEvidenceMimeType(selectedProject);
  const selectedProjectHasExternalEvidenceLink = isExternalEvidenceUrl(selectedProject);

  const evidenceNameLink = selectedProjectEvidenceUrl ? (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        void handleOpenEvidenceWalkthrough();
      }}
      className="truncate underline decoration-slate-400 underline-offset-2 hover:decoration-slate-700"
    >
      {selectedProjectEvidenceName}
    </button>
  ) : (
    selectedProjectEvidenceName
  );

  const handleSelectProject = (projectIndex: number) => {
    setSelectedProjectIndex(projectIndex);
    setIsEvaluationWalkthroughOpen(false);
    setEvidenceArrayBuffer(null);
    setEvidenceBlobUrl("");
    setEvidenceError("");
  };

  const handleOpenEvidenceWalkthrough = () => {
    if (selectedProjectIndex === null || !selectedProject) return;

    const evidenceSource = getProjectEvidenceSource(selectedProject);
    if (!evidenceSource) {
      setEvidenceError("No evidence document was returned from the shared portfolio.");
      return;
    }

    if (selectedProjectHasExternalEvidenceLink) {
      window.open(evidenceSource, "_blank", "noopener,noreferrer");
      return;
    }

    setIsEvaluationWalkthroughOpen(true);
    setEvidenceError("");
  };

  const goToPreviousProject = () => {
    if (selectedProjectIndex === null) return;
    setIsEvaluationWalkthroughOpen(false);
    setSelectedProjectIndex(Math.max(0, selectedProjectIndex - 1));
  };

  const goToNextProject = () => {
    if (selectedProjectIndex === null) return;
    setIsEvaluationWalkthroughOpen(false);
    setSelectedProjectIndex(Math.min(projects.length - 1, selectedProjectIndex + 1));
  };

  useEffect(() => {
    setEvidenceArrayBuffer(null);
    setEvidenceBlobUrl("");
    setEvidenceError("");
    setIsLoadingEvidence(false);

    if (!selectedProjectEvidenceUrl || selectedProjectHasExternalEvidenceLink) {
      return;
    }

    let mounted = true;
    let objectUrl = "";
    const abortController = new AbortController();

    const loadEvidence = async () => {
      setIsLoadingEvidence(true);

      try {
        const response = await apiFetch(selectedProjectEvidenceUrl, {
          cache: "no-store",
          signal: abortController.signal,
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch evidence document (${response.status}).`);
        }

        const blob = await response.blob();
        const mimeType = blob.type || selectedProjectEvidenceMimeType || "";
        const isPdf = mimeType === "application/pdf" || selectedProjectEvidenceName.toLowerCase().endsWith(".pdf");
        const isImage = mimeType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(selectedProjectEvidenceName) || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(selectedProjectEvidenceUrl);

        if (isPdf) {
          const arrayBuffer = await blob.arrayBuffer();
          if (!mounted) return;
          setEvidenceArrayBuffer(arrayBuffer);
        } else if (isImage) {
          objectUrl = URL.createObjectURL(blob);
          if (!mounted) return;
          setEvidenceBlobUrl(objectUrl);
        } else {
          if (!mounted) return;
          setEvidenceError("This evidence file type cannot be previewed inline.");
        }
      } catch (error) {
        if (!mounted || (error as Error)?.name === "AbortError") return;
        console.error("Error preloading shared evidence file:", error);
        setEvidenceError("Failed to load the evidence file from the shared portfolio.");
      } finally {
        if (mounted) setIsLoadingEvidence(false);
      }
    };

    void loadEvidence();

    return () => {
      mounted = false;
      abortController.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedProjectEvidenceUrl, selectedProjectEvidenceMimeType, selectedProjectEvidenceName, selectedProjectHasExternalEvidenceLink]);

  const renderEmptyState = () => (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <FileText className="h-8 w-8 text-slate-300" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-slate-900">Unable to open portfolio</p>
        <p className="max-w-xl text-sm text-slate-600">{error || "No data available."}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-poppins text-slate-900">
      <div className="border-b border-logo-blue/10 bg-gradient-to-r from-logo-blue/[0.04] via-white to-logo-gold/[0.08]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Beyond the CV: Candidate Verified Evidence
              </h1>
              <p className="mx-auto max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Review the candidate’s education, experience, and project evidence without leaving the page.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-2xl border border-logo-blue/10 bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Education</p>
                <p className="mt-1 text-2xl font-bold text-logo-blue">{summary?.educationCount ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-logo-blue/10 bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Experience</p>
                <p className="mt-1 text-2xl font-bold text-logo-blue">{summary?.experienceCount ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-logo-blue/10 bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Projects</p>
                <p className="mt-1 text-2xl font-bold text-logo-blue">{summary?.projectCount ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-logo-gold/20 bg-logo-gold/[0.08] px-4 py-3 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Readiness</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{safeText(summary?.readiness, "Pending")}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">AI maturity</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{safeText(summary?.maturity, "Low")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex min-h-[65vh] flex-col items-center justify-center gap-3 px-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-logo-blue" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">Loading shared portfolio</p>
                <p className="text-sm text-slate-600">Preparing the candidate profile and projects.</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">{renderEmptyState()}</div>
        ) : portfolio ? (
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="border-logo-blue/10 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                      <GraduationCap className="h-4 w-4 text-logo-blue" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[22rem] space-y-3 overflow-y-auto pr-2">
                    {(portfolio.userEducations ?? []).length ? (
                      portfolio.userEducations!.map((education, index) => (
                        <div key={`${education.school || education.fieldOfStudy || index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{getEducationLevelText(education.educationLevel)}</p>
                              <p className="mt-1 text-sm text-slate-600">{safeText(education.school, "School not provided")}</p>
                            </div>
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                              {formatRange(education.startDate, education.endDate)}
                            </p>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">
                            {safeText(education.fieldOfStudy, "Field of study not provided")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        No education records were shared.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-logo-blue/10 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                      <Briefcase className="h-4 w-4 text-logo-blue" />
                      Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[22rem] space-y-3 overflow-y-auto pr-2">
                    {(portfolio.userWorkExperiences ?? []).length ? (
                      portfolio.userWorkExperiences!.map((experience, index) => (
                        <div key={`${experience.company || experience.role || index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{safeText(experience.role, "Role not provided")}</p>
                              <p className="mt-1 text-sm text-logo-blue">{safeText(experience.company, "Company not provided")}</p>
                            </div>
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                              {formatRange(experience.startDate, experience.endDate)}
                            </p>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {safeText(experience.description, "No description provided")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        No work experience records were shared.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {selectedProject ? (
                <>
                  <Card className="border-logo-blue/10 shadow-sm">
                    <CardContent className="space-y-6 p-5 sm:p-6">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <Badge variant="secondary" className="rounded-full bg-logo-blue/10 text-logo-blue hover:bg-logo-blue/10">
                              Project {selectedProjectIndex !== null ? selectedProjectIndex + 1 : 0} of {projects.length}
                            </Badge>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                              {safeText(selectedProject.name, "Untitled project")}
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                              {safeText(selectedProject.goal, "No project goal was shared.")}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={selectedProjectIndex === null || selectedProjectIndex <= 0}
                            onClick={goToPreviousProject}
                            className="border-slate-200 text-slate-700 hover:border-logo-gold hover:text-logo-gold"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Previous
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={selectedProjectIndex === null || selectedProjectIndex >= projects.length - 1}
                            onClick={goToNextProject}
                            className="border-slate-200 text-slate-700 hover:border-logo-gold hover:text-logo-gold"
                          >
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Duration</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{safeText(selectedProject.duration)}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Goal</p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{safeText(selectedProject.goal, "No project goal was shared.")}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-logo-gold/20 bg-logo-gold/[0.06] p-4 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Project Approaches/Paths</p>
                        <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                          <div>
                            <p className="font-semibold text-slate-900">Path A: The Artisan</p>
                            <p>I did it all by hand. No AI, just my own hard work.</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Path B: The Architect</p>
                            <p>I used AI to help with the heavy lifting, but I checked every bit of it.</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Path C: The Orchestrator</p>
                            <p>I set up a system of AI tools to build it, focusing on integration.</p>
                          </div>
                        </div>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Path chosen</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{safeText(selectedProjectPathChosen, "Not shared")}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Document</p>
                        {selectedProject && (selectedProject.projectId !== undefined || selectedProjectEvidenceUrl) ? (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => void handleOpenEvidenceWalkthrough()}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                void handleOpenEvidenceWalkthrough();
                              }
                            }}
                            className="mt-3 flex h-auto w-full cursor-pointer justify-center rounded-2xl border border-logo-blue/10 bg-logo-blue/5 px-4 py-4 text-center hover:bg-logo-blue/10"
                          >
                          <div className="min-w-0 w-full">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {evidenceNameLink}
                            </p>
                          </div>
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-slate-500">No evidence was shared for this project.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {isEvaluationWalkthroughOpen ? (
                    <Card className="border-logo-blue/10 shadow-sm">
                      {isLoadingEvidence ? (
                        <CardContent className="flex min-h-[18rem] flex-col items-center justify-center gap-2 py-10 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin text-logo-blue" />
                          Loading evidence document...
                        </CardContent>
                      ) : (
                        <>
                          <CardHeader className="pb-3">
                            <div className="flex flex-col items-end gap-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEvaluationWalkthroughOpen(false)}
                                className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                              >
                                Close
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Document type: {selectedProjectEvidenceMimeType || "unknown"}
                              </p>
                              {evidenceError ? (
                                <p className="mt-3 text-sm text-slate-500">{evidenceError}</p>
                              ) : evidenceArrayBuffer ? (
                                <div className="mt-4 h-[32rem] overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                  <SimplePDFViewer
                                    data={evidenceArrayBuffer}
                                    fileName={selectedProjectEvidenceName || "Evidence document"}
                                  />
                                </div>
                              ) : evidenceBlobUrl ? (
                                <div className="mt-4 flex h-[32rem] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
                                  <img
                                    src={evidenceBlobUrl}
                                    alt={selectedProjectEvidenceName || "Evidence document"}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                              ) : selectedProjectEvidenceUrl ? (
                                <p className="mt-3 text-sm text-slate-500">This evidence could not be previewed inline.</p>
                              ) : (
                                <p className="mt-3 text-sm text-slate-500">No evidence document was shared for this project.</p>
                              )}
                            </div>

                            <div className="w-full rounded-3xl border border-logo-gold/30 bg-gradient-to-br from-logo-gold/10 via-white to-logo-blue/10 px-5 py-4 shadow-md shadow-logo-gold/10 text-center">
                              <CardTitle className="flex items-center justify-center gap-2 text-lg font-bold text-slate-900">
                                <FileText className="h-5 w-5 text-logo-gold" />
                                Skills Evaluation Walkthrough
                              </CardTitle>
                              <p className="mt-2 text-sm font-medium text-slate-600">
                                Click the drop down arrow to view the thought process.
                              </p>
                            </div>


                            {selectedProjectEvaluations.length ? (
                              <Accordion type="multiple" className="space-y-3">
                                {selectedProjectEvaluations.map((evaluation, evaluationIndex) => {
                                  const tone = getGradeTone(evaluation.grade);

                                  return (
                                    <AccordionItem
                                      key={`${selectedProjectIndex}-${evaluationIndex}`}
                                      value={`${selectedProjectIndex}-evaluation-${evaluationIndex}`}
                                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center"
                                    >
                                      <AccordionTrigger className="py-4 hover:no-underline">
                                        <div className="flex w-full flex-col items-center gap-3 text-center">
                                          <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                              {safeText(evaluation.label, `Question ${evaluationIndex + 1}`)}
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-slate-900">{safeText(evaluation.question)}</p>
                                          </div>
                                          <Badge
                                            variant="secondary"
                                            className={
                                              tone === "success"
                                                ? "rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                                : tone === "warning"
                                                  ? "rounded-full bg-amber-50 text-amber-700 hover:bg-amber-50"
                                                  : tone === "danger"
                                                    ? "rounded-full bg-red-50 text-red-700 hover:bg-red-50"
                                                    : "rounded-full bg-slate-200 text-slate-700 hover:bg-slate-200"
                                            }
                                          >
                                            {safeText(evaluation.grade)}
                                          </Badge>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="space-y-3 pb-1 text-center">
                                          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Candidate answer</p>
                                            <p className="mt-2 text-sm leading-6 text-slate-700">{safeText(evaluation.candidateAnswer)}</p>
                                          </div>
                                          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Justification</p>
                                            <p className="mt-2 text-sm leading-6 text-slate-700">{safeText(evaluation.justification)}</p>
                                          </div>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  );
                                })}
                              </Accordion>
                            ) : (
                              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                                No evaluation details were shared for this project.
                              </div>
                            )}

                            <div className="rounded-3xl border border-logo-blue/10 bg-gradient-to-br from-logo-blue/[0.04] via-white to-logo-gold/[0.08] p-5 text-left shadow-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Candidate Summary</p>
                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Readiness</p>
                                  <p className="mt-2 text-sm font-semibold text-slate-900">{safeText(summary?.readiness, "Pending")}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">AI maturity</p>
                                  <p className="mt-2 text-sm font-semibold text-slate-900">{safeText(summary?.maturity, "Low")}</p>
                                </div>
                              </div>
                              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Project justification</p>
                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                  {safeText(summary?.projectJustification, "No candidate summary was shared.")}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </>
                      )}
                    </Card>
                  ) : null}
                </>
              ) : (
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="p-6 text-sm text-slate-500">No project details were shared.</CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SharedPortfolioPdf;
