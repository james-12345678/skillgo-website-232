import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import AIIncubatorLayout from "@/components/AIIncubatorLayout";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const AIIncubator = () => {
  const curriculumRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [incubationSubTab, setIncubationSubTab] = useState("conversation");
  const [selectedNotification, setSelectedNotification] = useState<number | null>(null);
  const [readNotifications, setReadNotifications] = useState<number[]>([]);
  const [menteeStatus, setMenteeStatus] = useState<Record<number, string>>({
    1: "Active",
    2: "Active",
    3: "Active",
    4: "Completed"
  });
  const [draggedMentee, setDraggedMentee] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [selectedMenteeEmail, setSelectedMenteeEmail] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const handlePdfExport = async () => {
    if (!curriculumRef.current) return;

    try {
      const element = curriculumRef.current;

      const opt = {
        margin: 10,
        filename: "SkillGo Verify Ltd Curriculum.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          ignoreElements: (element: any) => {
            // Exclude elements that shouldn't be in PDF
            return element.classList?.contains('sticky') ||
                   element.classList?.contains('z-50') ||
                   element.classList?.contains('pdf-hidden');
          }
        },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const notifications = [
    {
      id: 1,
      title: "Marcus Chen - Healthcare AI Assistant",
      email: "marcus.chen@example.com",
      content: "Hi coach, I've completed my problem statement for an AI healthcare assistant. Ready for your review!",
      fullContent: "Stage: Problem Definition\n\nHi coach, I've worked through the problem definition phase and I'm ready for your feedback. Here's my scope:\n\nProblem: Healthcare providers struggle to manage patient inquiries and administrative tasks, leading to delayed responses and staff burnout.\n\nSolution: An AI-powered assistant that automates patient communication and appointment scheduling.\n\nDesired Outcome: Help 50+ clinics reduce administrative workload by 40% in the first year.\n\nSuccess Criteria:\n• 30+ clinic partnerships by Q3\n• 90%+ patient satisfaction score\n• 40% reduction in administrative staff hours\n\nI'd appreciate your thoughts on clarity, feasibility, and any adjustments you'd recommend.",
      color: "blue"
    },
    {
      id: 2,
      title: "Priya Patel - Educational Content Platform",
      email: "priya.patel@example.com",
      content: "Hi coach, I've completed my problem statement for an AI learning platform. Ready for your feedback!",
      fullContent: "Stage: Problem Definition\n\nHi coach, I've worked through the problem definition phase and I'm ready for your feedback. Here's my scope:\n\nProblem: Students from low-income backgrounds lack access to quality tutoring and personalized learning experiences.\n\nSolution: An AI-powered educational platform that provides adaptive learning paths and real-time tutoring support.\n\nDesired Outcome: Provide affordable education to 5,000+ students across developing regions.\n\nSuccess Criteria:\n• 2,000+ active users by end of Q2\n• 85%+ improvement in student test scores\n• Cost per student at $5/month or less\n\nI'd appreciate your thoughts on clarity, feasibility, and any adjustments you'd recommend.",
      color: "blue"
    },
    {
      id: 3,
      title: "Ahmed Hassan - E-commerce Personalization",
      email: "ahmed.hassan@example.com",
      content: "Hi coach, I've completed my problem statement for an AI e-commerce tool. Ready for your review!",
      fullContent: "Stage: Problem Definition\n\nHi coach, I've worked through the problem definition phase and I'm ready for your feedback. Here's my scope:\n\nProblem: Online retailers lose 70% of potential sales due to poor product recommendations and impersonal shopping experiences.\n\nSolution: An AI recommendation engine that personalizes product suggestions based on user behavior and preferences.\n\nDesired Outcome: Help 100+ online retailers increase conversion rates and average order value.\n\nSuccess Criteria:\n• 50+ store integrations by Q2\n• 35% average increase in conversion rates\n• 25% increase in average order value\n\nI'd appreciate your thoughts on clarity, feasibility, and any adjustments you'd recommend.",
      color: "blue"
    },
    {
      id: 4,
      title: "Lisa Rodriguez - HR Recruitment AI",
      email: "lisa.rodriguez@example.com",
      content: "Hi coach, I've completed my problem statement for an AI recruitment tool. Ready for your feedback!",
      fullContent: "Stage: Problem Definition\n\nHi coach, I've worked through the problem definition phase and I'm ready for your feedback. Here's my scope:\n\nProblem: Hiring managers spend excessive time reviewing resumes and screening candidates, slowing down the recruitment process.\n\nSolution: An AI-powered recruitment assistant that automatically screens resumes and ranks candidates.\n\nDesired Outcome: Help 200+ companies reduce hiring time by 50% and improve candidate quality.\n\nSuccess Criteria:\n• 100+ company sign-ups by Q2\n• 50% reduction in time-to-hire\n• 95%+ accuracy in candidate ranking\n\nI'd appreciate your thoughts on clarity, feasibility, and any adjustments you'd recommend.",
      color: "blue"
    },
    {
      id: 5,
      title: "James Okonkwo - Real Estate AI Valuation",
      email: "james.okonkwo@example.com",
      content: "Hi coach, I've completed my problem statement for an AI property valuation platform. Ready for your review!",
      fullContent: "Stage: Problem Definition\n\nHi coach, I've worked through the problem definition phase and I'm ready for your feedback. Here's my scope:\n\nProblem: Real estate professionals spend weeks gathering data and comparables to accurately value properties.\n\nSolution: An AI platform that analyzes market data and provides instant, accurate property valuations.\n\nDesired Outcome: Empower 1,000+ real estate agents with instant property insights in emerging markets.\n\nSuccess Criteria:\n• 500+ agent users by Q2\n• 95% valuation accuracy compared to manual appraisals\n• 80% reduction in valuation preparation time\n\nI'd appreciate your thoughts on clarity, feasibility, and any adjustments you'd recommend.",
      color: "blue"
    }
  ];

  const handleNotificationClick = (id: number) => {
    setSelectedNotification(id);
    const mentee = notifications.find(n => n.id === id);
    if (mentee) {
      setSelectedMenteeEmail(mentee.email);
    }
    if (!readNotifications.includes(id)) {
      setReadNotifications([...readNotifications, id]);
    }
  };

  const handleDragStart = (menteeId: number) => {
    setDraggedMentee(menteeId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: string) => {
    if (draggedMentee !== null) {
      setMenteeStatus((prev) => ({
        ...prev,
        [draggedMentee]: status
      }));
      setDraggedMentee(null);
    }
  };

  const handleStatusChange = (menteeId: number, status: string) => {
    setMenteeStatus((prev) => ({
      ...prev,
      [menteeId]: status
    }));
  };

  const handleDragEnd = () => {
    setDraggedMentee(null);
  };

  const dummyMentees = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      project: "AI Content Creator Platform",
      phase: "Problem Definition",
      status: "Active",
      progress: 25
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@example.com",
      project: "Smart Scheduling Assistant",
      phase: "Tools / Stack Selection",
      status: "Active",
      progress: 50
    },
    {
      id: 3,
      name: "Emma Williams",
      email: "emma.williams@example.com",
      project: "Customer Support Chatbot",
      phase: "AI Navigation",
      status: "Active",
      progress: 75
    },
    {
      id: 4,
      name: "David Martinez",
      email: "david.martinez@example.com",
      project: "AI Resume Builder",
      phase: "Skillgo Engine Submission",
      status: "Completed",
      progress: 100
    }
  ];

  const curriculumPhases = [
    {
      id: 1,
      title: "Week 1: AI Product Thinking (Problem → Use Case)",
      focus: "Turn an idea into a clear AI product opportunity",
      menteeActions: [
        "Identifies a real problem in their field",
        "Defines: Target user, Pain point, Why AI is needed",
        "Writes: Clear problem statement and expected output",
        "Defines success criteria",
      ],
      consultantGuidance: [
        "No vague ideas",
        "No 'nice-to-have' apps",
        "AI must be necessary, not decorative",
      ],
      outcome: "A validated AI product use case",
      image: "https://cdn.builder.io/api/v1/image/assets%2F339d34023c93424fb97c16b54a4bb307%2Fb4148f79369a42fd9a3dd29cc39f5b7a?format=webp&width=800&height=1200",
    },
    {
      id: 2,
      title: "Week 2: AI System Design + Stack Setup",
      focus: "Understand and build the system behind the product",
      coreFlow: "Input → Processing → Output",
      flowDetails: [
        "Input → Data (Firebase)",
        "Processing → Automation + AI (Make + OpenAI)",
        "Output → User Interface (Webflow)",
      ],
      menteeActions: [
        "Designs system flow",
        "Sets up Firebase database (structured data)",
        "Creates Make account + first scenario",
        "Connects OpenAI",
        "Builds Webflow app shell",
      ],
      consultantGuidance: [
        "Prevents overcomplication",
        "Explains why this stack works",
        "Mentions alternatives (Webflow → Bubble/Glide, Firebase → Supabase/Airtable, Make → Zapier/n8n)",
        "Ensures mentee sticks to the program stack",
      ],
      outcome: "A working system skeleton (connected but not complete)",
      image: "https://cdn.builder.io/api/v1/image/assets%2F339d34023c93424fb97c16b54a4bb307%2F75b42f0a347e43038089589357a0f501?format=webp&width=800&height=1200",
    },
    {
      id: 3,
      title: "Week 3: AI Product Build (Execution Phase)",
      focus: "Turn the system into a working AI-powered product",
      menteeActions: [
        "Builds data flow (Firebase records updating)",
        "Creates automation flows in Make",
        "Implements AI interaction (prompt + response)",
        "Connects user action → triggers automation → AI output stored + displayed",
        "Designs simple UI in Webflow (Input and Output screens)",
      ],
      skillsGained: [
        "Prompt engineering (practical, not theoretical)",
        "Debugging workflows",
        "Understanding AI limitations",
      ],
      consultantGuidance: [
        "Fixes bad prompts and broken logic",
        "Demonstrates efficient AI workflows",
        "Teaches product-oriented thinking",
      ],
      outcome: "A functional AI-powered product",
      image: "https://cdn.builder.io/api/v1/image/assets%2F339d34023c93424fb97c16b54a4bb307%2F3ed14b84b9ac4d938cf89255f8656aaa?format=webp&width=800&height=1200",
    },
    {
      id: 4,
      title: "Week 4: Proof of Work (SkillGo Engine)",
      focus: "Turn the product into verifiable proof",
      menteeActions: [
        "Finalizes product",
        "Cleans up UX, outputs, and flow reliability",
        "Submits to SkillGo Engine",
        "Generates shareable verification link",
      ],
      whatIsProven: [
        "Problem understanding",
        "System design",
        "AI integration",
        "Execution ability",
      ],
      outcome: "A verified AI Product Engineering artifact",
      showConsultantRole: true,
      image: "https://cdn.builder.io/api/v1/image/assets%2F339d34023c93424fb97c16b54a4bb307%2F1e225b37fd4248aaacc6168115c482e6?format=webp&width=800&height=1200",
    },
  ];

  return (
    <AIIncubatorLayout activeTab={activeTab} onTabChange={setActiveTab}>

      {/* Home Tab Content */}
      {activeTab === "home" && (
        <>
          <section className="py-4 sm:py-6">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">
                <span className="inline-block bg-gradient-to-br from-logo-blue to-logo-gold bg-clip-text text-transparent">
                  AI Product Engineering Program (No-Code Track)
                </span>
              </h1>
              <p className="mx-auto max-w-3xl text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
                Powered by skillgo verify Ltd.
              </p>
              <p className="mx-auto max-w-3xl text-base sm:text-lg text-slate-700 leading-relaxed font-semibold mt-4">
                Guide, mentor, and support mentees as they build verifiable AI products in 4 weeks
              </p>
            </div>
          </section>

          {/* Curriculum Summary Section */}
          <section className="py-8 sm:py-12">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    phase: 1,
                    title: "Week 1: AI Product Thinking",
                    description: "Turn an idea into a clear AI product opportunity"
                  },
                  {
                    phase: 2,
                    title: "Week 2: System Design + Stack",
                    description: "Input → Processing → Output. Build the system skeleton"
                  },
                  {
                    phase: 3,
                    title: "Week 3: AI Product Build",
                    description: "Execute and turn the system into a working AI-powered product"
                  },
                  {
                    phase: 4,
                    title: "Week 4: Proof of Work",
                    description: "Submit to SkillGo Engine and generate verifiable proof"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-5 rounded-lg border border-slate-200 hover:border-logo-gold/30 hover:bg-slate-50/50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-logo-blue to-logo-gold flex items-center justify-center text-white font-bold text-lg">
                      {item.phase}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Curriculum Tab Content */}
      {activeTab === "curriculum" && (
        <section className="py-4 sm:py-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* PDF Export Button */}
            <div className="flex justify-end px-4 sm:px-0 mb-4 pdf-hidden">
              <button
                onClick={handlePdfExport}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-logo-gold text-white font-semibold text-sm rounded-lg hover:bg-logo-blue transition-colors"
              >
                <span>📄</span>
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">DL</span>
              </button>
            </div>
            <div ref={curriculumRef} className="space-y-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">AI Product Engineering Program - 4 Week Curriculum</h1>

              {/* Default Stack Section */}
              <div className="bg-gradient-to-r from-logo-blue/10 to-logo-gold/10 rounded-lg border-2 border-logo-gold/20 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">🔧 Default Stack (Fixed for the Program)</h2>
                <p className="text-slate-700 font-semibold mb-4">Mention that: This is what trainees will use: This is non-negotiable during learning:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[
                    { tool: "App Interface", name: "Webflow" },
                    { tool: "Database", name: "Firebase" },
                    { tool: "Automation / Backend", name: "Make" },
                    { tool: "AI Layer", name: "OpenAI" }
                  ].map((item, idx) => (
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
                    {["Antigravity", "Windsurf", "Resend", "Stability", "Supabase"].map((app, idx) => (
                      <span key={idx} className="bg-white px-3 py-1.5 rounded-full border border-slate-200 text-sm font-medium text-slate-700">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {curriculumPhases.map((phase) => (
              <div
                key={phase.id}
                className="phase-card rounded-lg border-2 border-logo-gold/20 bg-gradient-to-br from-white to-logo-gold/5 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-logo-blue/10 to-logo-gold/10 px-4 sm:px-6 py-4 border-b border-logo-gold/10">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-logo-blue to-logo-gold flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {phase.id}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{phase.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">Focus: {phase.focus}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6 md:gap-8">
                  <div className="flex-1 space-y-6">
                    {/* Core Flow (Week 2) */}
                    {phase.coreFlow && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-logo-blue uppercase tracking-wide mb-2">Core Concept</h4>
                        <p className="text-sm font-semibold text-slate-900 mb-3">{phase.coreFlow}</p>
                        <ul className="space-y-1 pl-3 sm:pl-4">
                          {phase.flowDetails?.map((detail, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                              <span className="text-logo-gold font-bold">→</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Mentee Actions */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-logo-blue uppercase tracking-wide mb-2">Mentee does:</h4>
                      <ul className="space-y-1 pl-3 sm:pl-4">
                        {phase.menteeActions.map((action, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                            <span className="text-logo-blue font-bold flex-shrink-0">→</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Skills Gained */}
                    {phase.skillsGained && phase.skillsGained.length > 0 && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-logo-blue uppercase tracking-wide mb-2">Skills Gained:</h4>
                        <ul className="space-y-1 pl-3 sm:pl-4">
                          {phase.skillsGained.map((skill, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                              <span className="text-logo-blue font-bold flex-shrink-0">→</span>
                              <span>{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Consultant Guidance */}
                    {phase.consultantGuidance && phase.consultantGuidance.length > 0 && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-logo-gold uppercase tracking-wide mb-2">
                          Mentor role:
                        </h4>
                        <ul className="space-y-1 pl-3 sm:pl-4">
                          {phase.consultantGuidance.map((guidance, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                              <span className="text-logo-gold font-bold flex-shrink-0">→</span>
                              <span>{guidance}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* What Is Proven */}
                    {phase.whatIsProven && phase.whatIsProven.length > 0 && (
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-logo-gold uppercase tracking-wide mb-2">What is Proven:</h4>
                        <ul className="space-y-1 pl-3 sm:pl-4">
                          {phase.whatIsProven.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                              <span className="text-logo-gold font-bold flex-shrink-0">→</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Outcome */}
                    <div className="pt-4 border-t border-logo-gold/10">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Outcome:</h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{phase.outcome}</p>
                    </div>
                  </div>

                  {/* Image Section */}
                  {phase.image && (
                    <div className={`flex-shrink-0 w-full md:w-auto ${phase.id === 4 ? 'mt-2' : 'mt-8 md:mt-8'}`}>
                      <img
                        src={phase.image}
                        alt={phase.title}
                        className={`h-auto rounded-lg object-cover shadow-md w-full ${phase.id === 4 ? 'md:w-52' : 'md:w-96'}`}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          </div>
        </section>
      )}

      {/* Incubation Room Tab Content */}
      {activeTab === "incubation" && (
        <section className="py-4 sm:py-6 flex flex-col">
          <div className="max-w-6xl mx-auto w-full flex flex-col space-y-4">
            {/* My Mentees - List with Resources */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Mentees List */}
              <div className="w-full lg:w-80 bg-white rounded-lg border-2 border-slate-200 p-3 sm:p-4 overflow-y-auto max-h-96 lg:max-h-[calc(100vh-200px)]">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3">My Mentees</h3>
                <div className="space-y-2">
                  {dummyMentees.map((mentee) => (
                    <button
                      key={mentee.id}
                      onClick={() => setSelectedMenteeEmail(mentee.email)}
                      className={`w-full p-2 sm:p-3 rounded-lg text-left transition-all cursor-pointer border-l-4 ${
                        selectedMenteeEmail === mentee.email
                          ? "bg-logo-blue/10 border-logo-blue shadow-md"
                          : "bg-slate-50 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex flex-col">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">{mentee.name}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{mentee.email}</p>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">{mentee.project}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resources Area */}
              <div className="flex-1 flex flex-col bg-white rounded-lg border-2 border-slate-200 overflow-hidden">
                {selectedMenteeEmail !== null ? (
                  <>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-logo-blue/10 to-logo-gold/10 px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-200 shrink-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Connected with:</p>
                          <p className="text-sm font-semibold text-slate-900 break-words">{dummyMentees.find(m => m.email === selectedMenteeEmail)?.name}</p>
                        </div>
                        <button
                          onClick={() => setSelectedMenteeEmail(null)}
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
                        onClick={() => setIncubationSubTab("conversation")}
                        className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                          incubationSubTab === "conversation"
                            ? "text-logo-gold border-b-2 border-logo-gold -mb-0.5"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Meeting Link
                      </button>
                      <button
                        onClick={() => setIncubationSubTab("mentees")}
                        className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                          incubationSubTab === "mentees"
                            ? "text-logo-gold border-b-2 border-logo-gold -mb-0.5"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Project Sheet
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                      {incubationSubTab === "conversation" ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2">Meeting Link</h4>
                            <p className="text-xs text-slate-600 mb-3">Click below to join your meeting with {dummyMentees.find(m => m.email === selectedMenteeEmail)?.name}</p>
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
                            <p className="text-xs text-slate-600 mb-3">Access mentee's project tracking sheet</p>
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
                    <p className="text-slate-400 text-sm">Select a mentee to view resources</p>
                  </div>
                )}
              </div>
            </div>

            {/* Legacy Kanban Board (Hidden) */}
            {incubationSubTab === "hidden" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0">
              {/* In Progress Column */}
              <div className="flex flex-col bg-white rounded-lg border-2 border-logo-blue/20 overflow-hidden">
                <div className="bg-gradient-to-r from-logo-blue/10 to-logo-gold/10 px-4 py-3 border-b-2 border-logo-blue/20">
                  <h3 className="text-sm font-bold text-logo-blue uppercase tracking-wide">In Progress</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {dummyMentees.filter(m => menteeStatus[m.id] === "Active" || (m.status === "Active" && !menteeStatus[m.id])).length} mentees
                  </p>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop("Active")}
                  className="flex-1 p-4 overflow-y-auto space-y-3 bg-logo-blue/5 hover:bg-logo-blue/10 transition-colors"
                >
                  {dummyMentees
                    .filter(m => (menteeStatus[m.id] || m.status) === "Active")
                    .map((mentee) => (
                      <div
                        key={mentee.id}
                        draggable
                        onDragStart={() => handleDragStart(mentee.id)}
                        onDragEnd={handleDragEnd}
                        className={`p-3 bg-white rounded-lg border-2 border-logo-blue/30 hover:shadow-lg transition-all ${
                          draggedMentee === mentee.id ? "opacity-50 shadow-lg" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{mentee.name}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mentee.project}</p>
                          </div>
                          <div className="flex-shrink-0 relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === mentee.id ? null : mentee.id)}
                              className="px-2 py-1 text-xs font-semibold text-white bg-logo-blue hover:bg-logo-blue/90 rounded transition-colors whitespace-nowrap"
                              title="Change status"
                            >
                              Status
                            </button>
                            {openDropdown === mentee.id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg border-2 border-logo-blue/30 shadow-lg z-10">
                                <button
                                  onClick={() => {
                                    handleStatusChange(mentee.id, "Active");
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-logo-blue/10 transition-colors first:rounded-t-[6px] border-b border-logo-blue/10"
                                >
                                  ◉ In Progress
                                </button>
                                <button
                                  onClick={() => {
                                    handleStatusChange(mentee.id, "Completed");
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-logo-blue/10 transition-colors last:rounded-b-[6px]"
                                >
                                  ◉ Completed
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {dummyMentees.filter(m => (menteeStatus[m.id] || m.status) === "Active").length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-sm">No mentees in progress</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div className="flex flex-col bg-white rounded-lg border-2 border-logo-gold/20 overflow-hidden">
                <div className="bg-gradient-to-r from-logo-gold/10 to-logo-blue/10 px-4 py-3 border-b-2 border-logo-gold/20">
                  <h3 className="text-sm font-bold text-logo-gold uppercase tracking-wide">Completed</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {dummyMentees.filter(m => menteeStatus[m.id] === "Completed" || (m.status === "Completed" && !menteeStatus[m.id])).length} mentees
                  </p>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop("Completed")}
                  className="flex-1 p-4 overflow-y-auto space-y-3 bg-logo-gold/5 hover:bg-logo-gold/10 transition-colors"
                >
                  {dummyMentees
                    .filter(m => (menteeStatus[m.id] || m.status) === "Completed")
                    .map((mentee) => (
                      <div
                        key={mentee.id}
                        draggable
                        onDragStart={() => handleDragStart(mentee.id)}
                        onDragEnd={handleDragEnd}
                        className={`p-3 bg-white rounded-lg border-2 border-logo-gold/30 hover:shadow-lg transition-all ${
                          draggedMentee === mentee.id ? "opacity-50 shadow-lg" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{mentee.name}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{mentee.project}</p>
                          </div>
                          <div className="flex-shrink-0 relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === mentee.id ? null : mentee.id)}
                              className="px-2 py-1 text-xs font-semibold text-white bg-logo-gold hover:bg-logo-gold/90 rounded transition-colors whitespace-nowrap"
                              title="Change status"
                            >
                              Status
                            </button>
                            {openDropdown === mentee.id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg border-2 border-logo-gold/30 shadow-lg z-10">
                                <button
                                  onClick={() => {
                                    handleStatusChange(mentee.id, "Active");
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-logo-gold/10 transition-colors first:rounded-t-[6px] border-b border-logo-gold/10"
                                >
                                  ◉ In Progress
                                </button>
                                <button
                                  onClick={() => {
                                    handleStatusChange(mentee.id, "Completed");
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-logo-gold/10 transition-colors last:rounded-b-[6px]"
                                >
                                  ◉ Completed
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  {dummyMentees.filter(m => (menteeStatus[m.id] || m.status) === "Completed").length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-sm">No completed mentees</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </section>
      )}

    </AIIncubatorLayout>
  );
};

export default AIIncubator;
