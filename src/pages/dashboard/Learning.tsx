import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, GripVertical, X, CheckCircle, Clock, Zap } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  phase: string;
}

interface MentorFeedback {
  id: number;
  mentorName: string;
  phase: string;
  feedback: string;
  timestamp: string;
  read: boolean;
}

interface ChatMessage {
  id: number;
  sender: string;
  senderType: "user" | "mentor";
  message: string;
  timestamp: string;
}

interface BoardState {
  ideas: Task[];
  todo: Task[];
  inProgress: Task[];
  done: Task[];
}

const VALID_CLASSROOM_CODES = ["SKGV0001", "SKGV0002"];

const Learning = () => {
  const [activeTab, setActiveTab] = useState("curriculum");
  const [draggedTask, setDraggedTask] = useState<{ task: Task; fromColumn: string } | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null);
  const [selectedTabInMentorView, setSelectedTabInMentorView] = useState<"meeting" | "sheet">("meeting");
  const [classroomPassword, setClassroomPassword] = useState("");
  const [classroomUnlocked, setClassroomUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [board, setBoard] = useState<BoardState>({
    ideas: [
      {
        id: "idea-1",
        title: "Healthcare AI Assistant",
        description: "AI-powered assistant for managing patient inquiries",
        phase: "Ideation"
      },
      {
        id: "idea-2",
        title: "E-commerce Recommendation Engine",
        description: "Personalized product recommendations using AI",
        phase: "Ideation"
      }
    ],
    todo: [
      {
        id: "todo-1",
        title: "Define problem statement",
        description: "Document the problem, solution, and success criteria",
        phase: "Problem Definition"
      },
      {
        id: "todo-2",
        title: "Research AI tools and models",
        description: "Compare different AI models for your use case",
        phase: "Tools Selection"
      }
    ],
    inProgress: [
      {
        id: "progress-1",
        title: "Set up development environment",
        description: "Configure your tech stack and AI tools",
        phase: "Setup"
      },
      {
        id: "progress-2",
        title: "Implement AI integration",
        description: "Integrate your chosen AI model",
        phase: "Development"
      }
    ],
    done: [
      {
        id: "done-1",
        title: "Completed Onboarding",
        description: "Finished the incubator orientation",
        phase: "Orientation"
      },
      {
        id: "done-2",
        title: "AI Tools Training",
        description: "Completed AI proficiency certification",
        phase: "Training"
      }
    ]
  });

  const [newTasks, setNewTasks] = useState<{ [key: string]: string }>({
    ideas: "",
    todo: "",
    inProgress: "",
    done: ""
  });

  const mentorFeedback: MentorFeedback[] = [
    {
      id: 1,
      mentorName: "Dr. Sarah Chen",
      phase: "Problem Definition",
      feedback: "Great problem statement! Your healthcare AI assistant idea is clear and well-scoped. The success criteria are measurable and realistic. Next step: Research and select the right AI models for your use case.",
      timestamp: "2 days ago",
      read: false
    },
    {
      id: 2,
      mentorName: "Prof. James Wilson",
      phase: "Tools Selection",
      feedback: "I reviewed your tool choices. OpenAI API is a solid choice for this project. I'd suggest also exploring LangChain for better prompt management. Your tech stack looks good overall.",
      timestamp: "1 day ago",
      read: false
    },
    {
      id: 3,
      mentorName: "Dr. Sarah Chen",
      phase: "Development",
      feedback: "Excellent progress on the implementation! Your AI integration is clean and well-structured. Keep an eye on token usage and consider adding error handling for API failures.",
      timestamp: "Today",
      read: false
    }
  ];

  const handleDragStart = (task: Task, column: string) => {
    setDraggedTask({ task, fromColumn: column });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (toColumn: string) => {
    if (!draggedTask) return;

    const { task, fromColumn } = draggedTask;

    if (fromColumn === toColumn) {
      setDraggedTask(null);
      return;
    }

    setBoard((prev) => ({
      ...prev,
      [fromColumn]: prev[fromColumn as keyof BoardState].filter((t) => t.id !== task.id),
      [toColumn]: [...prev[toColumn as keyof BoardState], task]
    }));

    setDraggedTask(null);
  };

  const addTask = (column: string) => {
    const title = newTasks[column];
    if (!title.trim()) return;

    const newTask: Task = {
      id: `${column}-${Date.now()}`,
      title: title.trim(),
      description: "",
      phase: column
    };

    setBoard((prev) => ({
      ...prev,
      [column]: [...prev[column as keyof BoardState], newTask]
    }));

    setNewTasks((prev) => ({
      ...prev,
      [column]: ""
    }));
  };

  const deleteTask = (taskId: string, column: string) => {
    setBoard((prev) => ({
      ...prev,
      [column]: prev[column as keyof BoardState].filter((t) => t.id !== taskId)
    }));
  };


  const curriculumWeeks = [
    {
      week: "Week 1",
      title: "AI Product Thinking (Problem → Use Case)",
      icon: "💡",
      focus: "Turn an idea into a clear AI product opportunity",
      menteeActions: [
        "Identifies a real problem in their field",
        "Defines: Target user, Pain point, Why AI is needed",
        "Writes: Clear problem statement and expected output",
        "Defines success criteria"
      ],
      mentorEnforces: [
        "No vague ideas",
        "No 'nice-to-have' apps",
        "AI must be necessary, not decorative"
      ],
      outcome: "A validated AI product use case",
      status: "completed",
      image: "https://cdn.builder.io/api/v1/image/assets%2F504261bd412648c6acb06e736525122d%2F387fdd7f6e084e77be1beb3dec11e38a?format=webp&width=800&height=1200"
    },
    {
      week: "Week 2",
      title: "AI System Design + Stack Setup",
      icon: "🛠️",
      focus: "Understand and build the system behind the product",
      coreFlow: "Input → Processing → Output",
      flowDetails: [
        "Input → Data (Firebase)",
        "Processing → Automation + AI (Make + OpenAI)",
        "Output → User Interface (Webflow)"
      ],
      menteeActions: [
        "Designs system flow",
        "Sets up Firebase database",
        "Creates Make account + first scenario",
        "Connects OpenAI integration",
        "Builds Webflow app shell"
      ],
      mentorRole: [
        "Prevents overcomplication",
        "Explains why this stack works",
        "Mentions alternatives (Bubble, Supabase, Zapier)",
        "Ensures mentee sticks to program stack"
      ],
      outcome: "A working system skeleton (connected but not complete)",
      status: "in-progress",
      image: "https://cdn.builder.io/api/v1/image/assets%2F2f3ec985c9104f969941285b53d24f19%2F43dd3d36f94e4369b87785cfcd4b4ca3?format=webp&width=800&height=1200"
    },
    {
      week: "Week 3",
      title: "AI Product Build (Execution Phase)",
      icon: "🚀",
      focus: "Turn the system into a working AI-powered product",
      menteeActions: [
        "Builds data flow (Firebase records updating)",
        "Creates automation flows in Make",
        "Implements AI interaction (prompt + response)",
        "Connects user action → triggers automation → AI output stored + displayed",
        "Designs simple UI in Webflow (Input and Output screens)"
      ],
      skillsGained: [
        "Prompt engineering (practical, not theoretical)",
        "Debugging workflows",
        "Understanding AI limitations"
      ],
      mentorRole: [
        "Fixes bad prompts and broken logic",
        "Demonstrates efficient AI workflows",
        "Teaches product-oriented thinking"
      ],
      outcome: "A functional AI-powered product",
      status: "pending",
      image: "https://cdn.builder.io/api/v1/image/assets%2F2f3ec985c9104f969941285b53d24f19%2F003128b655a94a9db76b7fe521bbc85f?format=webp&width=800&height=1200"
    },
    {
      week: "Week 4",
      title: "Proof of Work (SkillGo Engine)",
      icon: "🎯",
      focus: "Turn the product into verifiable proof",
      menteeActions: [
        "Finalizes product",
        "Cleans up UX, outputs, and flow reliability",
        "Submits to SkillGo Engine",
        "Generates shareable verification link"
      ],
      whatIsProven: [
        "Problem understanding",
        "System design",
        "AI integration",
        "Execution ability"
      ],
      outcome: "A verified AI Product Engineering artifact",
      status: "pending",
      image: "https://cdn.builder.io/api/v1/image/assets%2F2f3ec985c9104f969941285b53d24f19%2F5d3f1e6beb1d4f1aafc2688c5981c85b?format=webp&width=800&height=1200"
    }
  ];

  const defaultStack = [
    { tool: "App Interface", name: "Webflow" },
    { tool: "Database", name: "Firebase" },
    { tool: "Automation / Backend", name: "Make" },
    { tool: "AI Layer", name: "OpenAI" }
  ];

  const additionalApps = ["Antigravity", "Windsurf", "Resend", "Stability", "Supabase"];

  const columns = [
    { key: "ideas", label: "Ideas", color: "border-blue-200 bg-blue-50" },
    { key: "todo", label: "To-Do", color: "border-yellow-200 bg-yellow-50" },
    { key: "inProgress", label: "In Progress", color: "border-purple-200 bg-purple-50" },
    { key: "done", label: "Done", color: "border-green-200 bg-green-50" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
          AI Product Engineering Program (No-Code Track)
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium tracking-wide">
          Powered by skillgo verify Ltd.
        </p>
        <p className="text-sm sm:text-base text-slate-700 font-semibold mt-6 max-w-2xl mx-auto leading-relaxed">
          Become an AI Product Engineer in your field and join the global AI talent market
        </p>
      </div>


      {/* Password Dialog for Classroom */}
      <Dialog open={activeTab === "progress" && !classroomUnlocked} onOpenChange={(open) => {
        if (!open) {
          setActiveTab("curriculum");
          setClassroomPassword("");
          setPasswordError("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Classroom Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Enter the classroom code to continue</p>
            <Input
              type="text"
              placeholder="Enter code"
              value={classroomPassword}
              onChange={(e) => {
                setClassroomPassword(e.target.value.trim().toUpperCase());
                setPasswordError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const normalizedCode = classroomPassword.trim().toUpperCase();
                  if (VALID_CLASSROOM_CODES.includes(normalizedCode)) {
                    setClassroomUnlocked(true);
                    setClassroomPassword("");
                  } else {
                    setPasswordError("Invalid code. Please try again.");
                  }
                }
              }}
              className="w-full"
            />
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            <Button
              onClick={() => {
                const normalizedCode = classroomPassword.trim().toUpperCase();
                if (VALID_CLASSROOM_CODES.includes(normalizedCode)) {
                  setClassroomUnlocked(true);
                  setClassroomPassword("");
                } else {
                  setPasswordError("Invalid code. Please try again.");
                }
              }}
              className="w-full bg-logo-gold hover:bg-logo-blue text-white"
            >
              Unlock
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 border-b-2 border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`pb-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === "curriculum"
              ? "text-logo-gold border-b-2 border-logo-gold -mb-0.5"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Learning Path
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          className={`pb-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap ${
            activeTab === "progress"
              ? "text-logo-gold border-b-2 border-logo-gold -mb-0.5"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Classroom
        </button>
        <a
          href="/register-cohort"
          className="pb-4 px-2 sm:px-4 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap text-slate-600 hover:text-logo-gold"
        >
          Enroll for the Next Cohort
        </a>
      </div>

      {/* Curriculum Tab */}
      {activeTab === "curriculum" && (
        <div className="space-y-8">
          {/* Default Stack Section */}
          <div className="bg-gradient-to-r from-logo-blue/10 to-logo-gold/10 rounded-lg border-2 border-logo-gold/20 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {defaultStack.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">{item.tool}</p>
                  <p className="text-lg font-bold text-logo-gold mt-1">{item.name}</p>
                </div>
              ))}
            </div>

            {/* Additional Apps Section */}
            <div className="mt-6 pt-6 border-t border-logo-gold/20">
              <p className="text-sm font-semibold text-slate-900 mb-3">Additional Apps & Tools</p>
              <div className="flex flex-wrap gap-2">
                {additionalApps.map((app, idx) => (
                  <span key={idx} className="bg-white px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-slate-700">
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 4-Week Curriculum */}
          <div className="space-y-6">
            {curriculumWeeks.map((week, idx) => (
              <Card
                key={idx}
                className={`border-l-4 ${
                  week.status === "completed"
                    ? "border-l-green-500 bg-green-50/50"
                    : week.status === "in-progress"
                    ? "border-l-logo-gold bg-amber-50/50"
                    : "border-l-slate-300 bg-slate-50/50"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <span className="text-2xl">{week.icon}</span>
                        {week.week}: {week.title}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-2 font-semibold">{week.focus}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {week.status === "completed" && <CheckCircle className="h-6 w-6 text-green-600" />}
                      {week.status === "in-progress" && <Clock className="h-6 w-6 text-logo-gold animate-pulse" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      {/* Core Flow (Week 2) */}
                      {week.coreFlow && (
                    <div>
                      <h4 className="text-sm font-bold text-logo-blue uppercase tracking-wide mb-2">Core Concept</h4>
                      <p className="text-sm font-semibold text-slate-900 mb-3">{week.coreFlow}</p>
                      <ul className="space-y-2">
                        {week.flowDetails?.map((detail, i) => (
                          <li key={i} className="flex gap-2 text-sm text-slate-700">
                            <span className="text-logo-gold font-bold">→</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mentee Actions */}
                  <div>
                    <h4 className="text-sm font-bold text-logo-blue uppercase tracking-wide mb-2">Mentee Does</h4>
                    <ul className="space-y-1">
                      {week.menteeActions?.map((action, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-logo-blue mt-1.5 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mentor Enforces / Mentor Role */}
                  {(week.mentorEnforces || week.mentorRole) && (
                    <div>
                      <h4 className="text-sm font-bold text-logo-gold uppercase tracking-wide mb-2">
                        {week.mentorEnforces ? "Mentor Enforces" : "Mentor Role"}
                      </h4>
                      <ul className="space-y-1">
                        {(week.mentorEnforces || week.mentorRole)?.map((item, i) => (
                          <li key={i} className="flex gap-2 text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-logo-gold mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills Gained */}
                  {week.skillsGained && (
                    <div>
                      <h4 className="text-sm font-bold text-logo-blue uppercase tracking-wide mb-2">Skills Gained</h4>
                      <ul className="space-y-1">
                        {week.skillsGained.map((skill, i) => (
                          <li key={i} className="flex gap-2 text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-logo-blue mt-1.5 flex-shrink-0" />
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What Is Proven */}
                  {week.whatIsProven && (
                    <div>
                      <h4 className="text-sm font-bold text-logo-gold uppercase tracking-wide mb-2">What Is Proven</h4>
                      <ul className="space-y-1">
                        {week.whatIsProven.map((item, i) => (
                          <li key={i} className="flex gap-2 text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-logo-gold mt-1.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                      {/* Outcome */}
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm font-semibold text-slate-900 mb-1">👉 Outcome:</p>
                        <p className="text-sm text-slate-700">{week.outcome}</p>
                      </div>
                    </div>
                    {week.image && (
                      <div className="flex-shrink-0 w-full md:w-96">
                        <img
                          src={week.image}
                          alt={week.title}
                          className="w-full h-auto rounded-lg object-cover shadow-md"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Classroom Tab - Mentor Connection */}
      {activeTab === "progress" && classroomUnlocked && (
        <section className="py-3 sm:py-4 flex flex-col min-h-screen bg-slate-50">
          <div className="max-w-6xl mx-auto w-full px-2 sm:px-4 flex flex-col lg:flex-row gap-3 sm:gap-4 flex-1">
            {/* Mentor List Panel */}
            <div className="w-full lg:w-72 bg-white rounded-lg border-2 border-slate-200 p-2 sm:p-3 overflow-y-auto flex flex-col max-h-96 lg:max-h-[calc(100vh-200px)] shrink-0 order-first lg:order-last">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3">My Mentors</h3>

              {/* Mentor List */}
              <div className="space-y-2">
                {mentorFeedback.map((mentor) => (
                  <button
                    key={mentor.id}
                    onClick={() => setSelectedMentorId(mentor.id)}
                    className={`w-full p-2 sm:p-3 rounded-lg text-left transition-all cursor-pointer border-l-4 ${
                      selectedMentorId === mentor.id
                        ? "bg-logo-blue/10 border-logo-blue shadow-md"
                        : "bg-slate-50 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex flex-col">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">{mentor.mentorName}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {mentor.mentorName === "Dr. Sarah Chen"
                          ? "sarah.chen@skillgo.africa"
                          : mentor.mentorName === "Prof. James Wilson"
                          ? "james.wilson@skillgo.africa"
                          : "mentor@skillgo.africa"}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{mentor.phase}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mentor Resources Area */}
            <div className="flex-1 flex flex-col bg-white rounded-lg border-2 border-slate-200 overflow-hidden min-h-0 order-last lg:order-first">
              {selectedMentorId !== null ? (
                <>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-logo-blue/10 to-logo-gold/10 px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-200 shrink-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Connected with:</p>
                        <p className="text-sm font-semibold text-slate-900 break-words">{mentorFeedback.find(m => m.id === selectedMentorId)?.mentorName}</p>
                      </div>
                      <button
                        onClick={() => setSelectedMentorId(null)}
                        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        title="Close"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Mini Tabs */}
                  <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
                    <button
                      onClick={() => setSelectedTabInMentorView("meeting")}
                      className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                        selectedTabInMentorView === "meeting"
                          ? "text-logo-gold border-b-2 border-logo-gold -mb-0.5"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Meeting Link
                    </button>
                    <button
                      onClick={() => setSelectedTabInMentorView("sheet")}
                      className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                        selectedTabInMentorView === "sheet"
                          ? "text-logo-gold border-b-2 border-logo-gold -mb-0.5"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Project Sheet
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                    {selectedTabInMentorView === "meeting" ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">Meeting Link</h4>
                          <p className="text-xs text-slate-600 mb-3">Click below to join your meeting with {mentorFeedback.find(m => m.id === selectedMentorId)?.mentorName}</p>
                          <a
                            href="https://meet.google.com/knq-kbin-fiu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-full text-center bg-logo-gold hover:bg-logo-blue text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                          >
                            Open Google Meet
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">Project Sheet</h4>
                          <p className="text-xs text-slate-600 mb-3">Access your project tracking sheet</p>
                          <a
                            href="https://docs.google.com/spreadsheets/d/15W1NvLukQDXGeHrbckooYYGg02F8JI35ztTXK75ArHQ/edit?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block w-full text-center bg-logo-gold hover:bg-logo-blue text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                          >
                            Open Google Sheet
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-4">
                  <p className="text-slate-400 text-sm">Select a mentor to view resources</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Learning;
