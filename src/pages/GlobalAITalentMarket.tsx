import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Search } from "lucide-react";

interface Talent {
  id: string;
  name: string;
  title: string;
  experience: string;
  experienceYears: number;
  courses: string[];
  keywords: string[];
  aiTools: string[];
  education: string;
  rating: number;
  projectsCompleted: number;
  clientsServed: number;
  yearsExperienceAI: number;
}

const dummyTalents: Talent[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "AI/ML Engineer",
    experience: "5+ years",
    experienceYears: 5,
    courses: ["Machine Learning", "Deep Learning", "NLP"],
    keywords: ["PyTorch", "TensorFlow", "Computer Vision"],
    aiTools: ["GPT-4", "Claude", "Stable Diffusion"],
    education: "MS Computer Science",
    rating: 4.9,
    projectsCompleted: 47,
    clientsServed: 23,
    yearsExperienceAI: 5,
  },
  {
    id: "2",
    name: "Priya Patel",
    title: "AI Product Manager",
    experience: "7+ years",
    experienceYears: 7,
    courses: ["Product Strategy", "AI Ethics", "Business Strategy"],
    keywords: ["Product Management", "AI Strategy", "Roadmapping"],
    aiTools: ["ChatGPT", "Midjourney", "Claude"],
    education: "MBA",
    rating: 4.7,
    projectsCompleted: 56,
    clientsServed: 31,
    yearsExperienceAI: 6,
  },
  {
    id: "3",
    name: "Ahmed Hassan",
    title: "Data Scientist",
    experience: "3+ years",
    experienceYears: 3,
    courses: ["Data Analysis", "Machine Learning", "Statistics"],
    keywords: ["Python", "SQL", "Data Visualization"],
    aiTools: ["ChatGPT", "Cohere", "Claude"],
    education: "BS Mathematics",
    rating: 4.8,
    projectsCompleted: 32,
    clientsServed: 18,
    yearsExperienceAI: 3,
  },
  {
    id: "4",
    name: "Kai Chen",
    title: "LLM Specialist",
    experience: "4+ years",
    experienceYears: 4,
    courses: ["Large Language Models", "Prompt Engineering", "Deep Learning"],
    keywords: ["LangChain", "Prompt Engineering", "RAG"],
    aiTools: ["GPT-4", "Claude", "Gemini"],
    education: "MS Artificial Intelligence",
    rating: 4.9,
    projectsCompleted: 38,
    clientsServed: 21,
    yearsExperienceAI: 4,
  },
  {
    id: "5",
    name: "Elena Rodriguez",
    title: "Machine Learning Engineer",
    experience: "6+ years",
    experienceYears: 6,
    courses: ["Machine Learning", "Reinforcement Learning", "Data Analysis"],
    keywords: ["TensorFlow", "Kubernetes", "Production ML"],
    aiTools: ["Vertex AI", "SageMaker", "Claude"],
    education: "PhD Computer Science",
    rating: 4.8,
    projectsCompleted: 52,
    clientsServed: 27,
    yearsExperienceAI: 6,
  },
  {
    id: "6",
    name: "Marcus Thompson",
    title: "Computer Vision Expert",
    experience: "5+ years",
    experienceYears: 5,
    courses: ["Computer Vision", "Deep Learning", "Machine Learning"],
    keywords: ["OpenCV", "YOLO", "Vision Transformers"],
    aiTools: ["Stable Diffusion", "DALL-E", "Claude"],
    education: "MS Computer Science",
    rating: 4.9,
    projectsCompleted: 44,
    clientsServed: 19,
    yearsExperienceAI: 5,
  },
  {
    id: "7",
    name: "Amara Okonkwo",
    title: "AI Ethics Lead",
    experience: "4+ years",
    experienceYears: 4,
    courses: ["AI Ethics", "Responsible AI", "Data Analysis"],
    keywords: ["AI Governance", "Bias Detection", "Fairness"],
    aiTools: ["ChatGPT", "Midjourney", "Cohere"],
    education: "BS Mathematics",
    rating: 4.9,
    projectsCompleted: 35,
    clientsServed: 20,
    yearsExperienceAI: 4,
  },
  {
    id: "8",
    name: "David Kim",
    title: "NLP Engineer",
    experience: "3+ years",
    experienceYears: 3,
    courses: ["NLP", "Large Language Models", "Machine Learning"],
    keywords: ["NLTK", "SpaCy", "Transformers"],
    aiTools: ["GPT-4", "Gemini", "Vertex AI"],
    education: "MS Artificial Intelligence",
    rating: 4.8,
    projectsCompleted: 29,
    clientsServed: 16,
    yearsExperienceAI: 3,
  },
  {
    id: "9",
    name: "Lisa Zhang",
    title: "Generative AI Specialist",
    experience: "4+ years",
    experienceYears: 4,
    courses: ["Machine Learning", "Prompt Engineering", "Business Strategy"],
    keywords: ["Image Generation", "Model Fine-tuning", "API Integration"],
    aiTools: ["Midjourney", "Stable Diffusion", "GPT-4"],
    education: "MS Computer Science",
    rating: 4.7,
    projectsCompleted: 41,
    clientsServed: 24,
    yearsExperienceAI: 4,
  },
  {
    id: "10",
    name: "James Osei",
    title: "MLOps Engineer",
    experience: "6+ years",
    experienceYears: 6,
    courses: ["Machine Learning", "Reinforcement Learning", "Statistics"],
    keywords: ["Docker", "Kubernetes", "Model Deployment"],
    aiTools: ["SageMaker", "Vertex AI", "Claude"],
    education: "PhD Computer Science",
    rating: 4.8,
    projectsCompleted: 58,
    clientsServed: 32,
    yearsExperienceAI: 6,
  },
  {
    id: "11",
    name: "Nina Gupta",
    title: "AI Strategy Consultant",
    experience: "7+ years",
    experienceYears: 7,
    courses: ["Product Strategy", "AI Ethics", "Business Strategy"],
    keywords: ["Strategic Planning", "Market Analysis", "Tech Leadership"],
    aiTools: ["ChatGPT", "Claude", "Gemini"],
    education: "MBA",
    rating: 4.8,
    projectsCompleted: 62,
    clientsServed: 35,
    yearsExperienceAI: 7,
  },
];

const GlobalAITalentMarket = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedEducation, setSelectedEducation] = useState<string | null>(null);

  const experiences = useMemo(() => {
    const unique = new Set(dummyTalents.map(t => t.experience));
    return Array.from(unique).sort((a, b) => {
      const aYears = parseInt(a.split("+")[0]);
      const bYears = parseInt(b.split("+")[0]);
      return bYears - aYears;
    });
  }, []);

  const courses = useMemo(() => {
    const unique = new Set<string>();
    dummyTalents.forEach(t => t.courses.forEach(c => unique.add(c)));
    return Array.from(unique).sort();
  }, []);

  const aiTools = useMemo(() => {
    const unique = new Set<string>();
    dummyTalents.forEach(t => t.aiTools.forEach(tool => unique.add(tool)));
    return Array.from(unique).sort();
  }, []);

  const educationLevels = useMemo(() => {
    const unique = new Set(dummyTalents.map(t => t.education));
    return Array.from(unique).sort();
  }, []);

  const hasActiveFilter = searchQuery !== "" || selectedExperience !== null || selectedCourse !== null || selectedTool !== null || selectedEducation !== null;

  const filteredTalents = useMemo(() => {
    if (!hasActiveFilter) {
      return [];
    }

    // Each filter works independently - OR logic
    let results = new Set<Talent>();

    // If search query exists, add matching talents
    if (searchQuery !== "") {
      const searchMatches = dummyTalents.filter(talent =>
        talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      searchMatches.forEach(t => results.add(t));
    }

    // If experience filter exists, add matching talents
    if (selectedExperience !== null) {
      const expMatches = dummyTalents.filter(t => t.experience === selectedExperience);
      expMatches.forEach(t => results.add(t));
    }

    // If course filter exists, add matching talents
    if (selectedCourse !== null) {
      const courseMatches = dummyTalents.filter(t => t.courses.includes(selectedCourse));
      courseMatches.forEach(t => results.add(t));
    }

    // If tool filter exists, add matching talents
    if (selectedTool !== null) {
      const toolMatches = dummyTalents.filter(t => t.aiTools.includes(selectedTool));
      toolMatches.forEach(t => results.add(t));
    }

    // If education filter exists, add matching talents
    if (selectedEducation !== null) {
      const eduMatches = dummyTalents.filter(t => t.education === selectedEducation);
      eduMatches.forEach(t => results.add(t));
    }

    return Array.from(results);
  }, [searchQuery, selectedExperience, selectedCourse, selectedTool, selectedEducation, hasActiveFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedExperience(null);
    setSelectedCourse(null);
    setSelectedTool(null);
    setSelectedEducation(null);
  };

  const activeFilters = [selectedExperience, selectedCourse, selectedTool, selectedEducation].filter(f => f !== null).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6 pb-8">
        <BackButton fallbackPath="/" />
      </div>

      {/* Header */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Global AI Talent <span className="text-logo-gold">Market</span>
          </h1>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-2xl">
            <div className="p-3 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border border-foreground/10">
              <p className="text-2xl font-bold text-logo-blue">{dummyTalents.reduce((sum, t) => sum + t.projectsCompleted, 0)}</p>
              <p className="text-xs text-foreground/70">Projects completed</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border border-foreground/10">
              <p className="text-2xl font-bold text-logo-gold">{dummyTalents.reduce((sum, t) => sum + t.clientsServed, 0)}</p>
              <p className="text-xs text-foreground/70">Clients served</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border border-foreground/10">
              <p className="text-2xl font-bold text-foreground">{dummyTalents.length}</p>
              <p className="text-xs text-foreground/70">Talents available</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 border border-foreground/10">
              <p className="text-2xl font-bold text-foreground">{(dummyTalents.reduce((sum, t) => sum + t.rating, 0) / dummyTalents.length).toFixed(1)}</p>
              <p className="text-xs text-foreground/70">Average rating</p>
            </div>
          </div>

          <p className="text-foreground/70 text-sm">
            Discover verified AI professionals
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="py-6 border-y border-foreground/10">
        <div className="container mx-auto px-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-3 h-4 w-4 text-foreground/50" />
            <input
              type="text"
              placeholder="Search by name, title, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-foreground/20 bg-background text-sm focus:outline-none focus:border-logo-blue"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-foreground/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Filters</h3>
            {activeFilters > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-logo-blue hover:text-logo-blue/80 font-medium"
              >
                Clear ({activeFilters})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={selectedExperience || ""}
              onChange={(e) => setSelectedExperience(e.target.value || null)}
              className="px-3 py-2 rounded-lg border border-foreground/20 bg-background text-sm focus:outline-none focus:border-logo-blue"
            >
              <option value="">Experience</option>
              {experiences.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>

            <select
              value={selectedCourse || ""}
              onChange={(e) => setSelectedCourse(e.target.value || null)}
              className="px-3 py-2 rounded-lg border border-foreground/20 bg-background text-sm focus:outline-none focus:border-logo-blue"
            >
              <option value="">Course</option>
              {courses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>

            <select
              value={selectedTool || ""}
              onChange={(e) => setSelectedTool(e.target.value || null)}
              className="px-3 py-2 rounded-lg border border-foreground/20 bg-background text-sm focus:outline-none focus:border-logo-blue"
            >
              <option value="">AI Tools</option>
              {aiTools.map(tool => (
                <option key={tool} value={tool}>{tool}</option>
              ))}
            </select>

            <select
              value={selectedEducation || ""}
              onChange={(e) => setSelectedEducation(e.target.value || null)}
              className="px-3 py-2 rounded-lg border border-foreground/20 bg-background text-sm focus:outline-none focus:border-logo-blue"
            >
              <option value="">Education</option>
              {educationLevels.map(edu => (
                <option key={edu} value={edu}>{edu}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {hasActiveFilter && (
            <p className="text-sm text-foreground/70 mb-6">
              {filteredTalents.length} talent{filteredTalents.length !== 1 ? 's' : ''}
            </p>
          )}

          {!hasActiveFilter ? (
            <div className="text-center py-12 max-w-2xl mx-auto">
              <p className="text-foreground/70 text-base mb-2">Start searching or apply filters</p>
              <p className="text-foreground/50 text-sm">Use the search bar or filters above to discover verified AI talents</p>
            </div>
          ) : filteredTalents.length > 0 ? (
            <div className="space-y-3 max-w-3xl">
              {filteredTalents.map(talent => (
                <div
                  key={talent.id}
                  className="p-4 rounded-lg border border-foreground/10 bg-gradient-to-br from-white via-logo-blue/5 to-logo-gold/5 hover:border-foreground/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-sm">{talent.name}</h3>
                          <p className="text-xs text-logo-blue font-medium">{talent.title}</p>
                        </div>
                        <span className="text-sm font-bold text-foreground/80">★ {talent.rating}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-3 text-xs text-foreground/70">
                        <span>{talent.projectsCompleted} projects</span>
                        <span>{talent.clientsServed} clients</span>
                        <span>{talent.experience}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs bg-logo-blue/10 text-logo-blue px-2 py-1 rounded">
                          {talent.education}
                        </span>
                        {talent.aiTools.slice(0, 2).map(tool => (
                          <span key={tool} className="text-xs bg-logo-gold/10 text-logo-gold px-2 py-1 rounded">
                            {tool}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {talent.keywords.slice(0, 2).map(kw => (
                          <span key={kw} className="text-xs text-foreground/60">
                            {kw}
                          </span>
                        ))}
                        {talent.keywords.length > 2 && (
                          <span className="text-xs text-foreground/60">
                            +{talent.keywords.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-logo-blue hover:bg-logo-blue/90 text-white text-xs whitespace-nowrap flex-shrink-0"
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-foreground/70 text-sm mb-4">No talents match your filters</p>
              <button
                onClick={clearFilters}
                className="text-logo-blue hover:text-logo-blue/80 text-sm font-medium"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GlobalAITalentMarket;
