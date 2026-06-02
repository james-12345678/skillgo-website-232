import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolItem {
  name: string;
  href: string;
  badge: string;
  badgeClass: string;
  cardClass: string;
  description: string;
}

const toolItems: ToolItem[] = [
  { name: "ChatGPT", href: "https://chatgpt.com", badge: "CG", badgeClass: "bg-slate-900 text-white", cardClass: "border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:border-slate-400 hover:shadow-slate-200/60", description: "Draft ideas, prompts, and content." },
  { name: "Canva", href: "https://www.canva.com", badge: "CV", badgeClass: "bg-cyan-500 text-white", cardClass: "border-cyan-200 bg-gradient-to-br from-cyan-50 to-white hover:border-cyan-400 hover:shadow-cyan-200/60", description: "Create quick designs and posters." },
  { name: "Figma", href: "https://www.figma.com", badge: "FG", badgeClass: "bg-fuchsia-500 text-white", cardClass: "border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-white hover:border-fuchsia-400 hover:shadow-fuchsia-200/60", description: "Design and collaborate on layouts." },
  { name: "Google Docs", href: "https://docs.google.com/document/create", badge: "GD", badgeClass: "bg-blue-600 text-white", cardClass: "border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:border-blue-400 hover:shadow-blue-200/60", description: "Write documents and reports." },
  { name: "Google Sheets", href: "https://docs.google.com/spreadsheets/create", badge: "GS", badgeClass: "bg-emerald-600 text-white", cardClass: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-400 hover:shadow-emerald-200/60", description: "Track data and analysis." },
  { name: "Microsoft Excel", href: "https://www.office.com/launch/excel", badge: "XL", badgeClass: "bg-green-700 text-white", cardClass: "border-green-200 bg-gradient-to-br from-green-50 to-white hover:border-green-400 hover:shadow-green-200/60", description: "Build spreadsheets and formulas." },
  { name: "Notion", href: "https://www.notion.so", badge: "NO", badgeClass: "bg-zinc-900 text-white", cardClass: "border-zinc-200 bg-gradient-to-br from-zinc-50 to-white hover:border-zinc-400 hover:shadow-zinc-200/60", description: "Organize notes, tasks, and docs." },
  { name: "Trello", href: "https://trello.com", badge: "TR", badgeClass: "bg-sky-600 text-white", cardClass: "border-sky-200 bg-gradient-to-br from-sky-50 to-white hover:border-sky-400 hover:shadow-sky-200/60", description: "Manage tasks on boards." },
  { name: "Slack", href: "https://slack.com", badge: "SL", badgeClass: "bg-purple-600 text-white", cardClass: "border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:border-purple-400 hover:shadow-purple-200/60", description: "Collaborate with a team." },
  { name: "Google Slides", href: "https://docs.google.com/presentation/create", badge: "SL", badgeClass: "bg-amber-500 text-white", cardClass: "border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:border-amber-400 hover:shadow-amber-200/60", description: "Create presentations." },
  { name: "Meta Business Suite", href: "https://business.facebook.com", badge: "MB", badgeClass: "bg-blue-700 text-white", cardClass: "border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:border-blue-500 hover:shadow-blue-200/60", description: "Manage Meta pages and ads." },
  { name: "Google Analytics", href: "https://analytics.google.com", badge: "GA", badgeClass: "bg-orange-500 text-white", cardClass: "border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:border-orange-400 hover:shadow-orange-200/60", description: "Track website performance." },
  { name: "Mailchimp", href: "https://mailchimp.com", badge: "MC", badgeClass: "bg-yellow-500 text-slate-900", cardClass: "border-yellow-200 bg-gradient-to-br from-yellow-50 to-white hover:border-yellow-400 hover:shadow-yellow-200/60", description: "Run email campaigns." },
  { name: "WordPress", href: "https://wordpress.com", badge: "WP", badgeClass: "bg-slate-800 text-white", cardClass: "border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:border-slate-400 hover:shadow-slate-200/60", description: "Build and publish websites." },
  { name: "Perplexity AI", href: "https://www.perplexity.ai", badge: "PX", badgeClass: "bg-indigo-600 text-white", cardClass: "border-indigo-200 bg-gradient-to-br from-indigo-50 to-white hover:border-indigo-400 hover:shadow-indigo-200/60", description: "Research and answer questions." },
  { name: "Jasper AI", href: "https://www.jasper.ai", badge: "JP", badgeClass: "bg-rose-600 text-white", cardClass: "border-rose-200 bg-gradient-to-br from-rose-50 to-white hover:border-rose-400 hover:shadow-rose-200/60", description: "Write marketing content faster." },
  { name: "Google Gemini", href: "https://gemini.google.com", badge: "GM", badgeClass: "bg-violet-600 text-white", cardClass: "border-violet-200 bg-gradient-to-br from-violet-50 to-white hover:border-violet-400 hover:shadow-violet-200/60", description: "Use Google’s AI assistant." },
  { name: "Adobe Photoshop", href: "https://www.adobe.com/products/photoshop.html", badge: "PS", badgeClass: "bg-blue-800 text-white", cardClass: "border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:border-blue-500 hover:shadow-blue-200/60", description: "Edit images and graphics." },
  { name: "Adobe Illustrator", href: "https://www.adobe.com/products/illustrator.html", badge: "AI", badgeClass: "bg-orange-700 text-white", cardClass: "border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:border-orange-500 hover:shadow-orange-200/60", description: "Create vector artwork." },
  { name: "HubSpot", href: "https://www.hubspot.com", badge: "HS", badgeClass: "bg-orange-600 text-white", cardClass: "border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:border-orange-400 hover:shadow-orange-200/60", description: "Manage leads and marketing." },
  { name: "Miro", href: "https://miro.com", badge: "MI", badgeClass: "bg-yellow-600 text-white", cardClass: "border-yellow-200 bg-gradient-to-br from-yellow-50 to-white hover:border-yellow-400 hover:shadow-yellow-200/60", description: "Plan ideas on collaborative boards." },
  { name: "Asana", href: "https://asana.com", badge: "AS", badgeClass: "bg-pink-600 text-white", cardClass: "border-pink-200 bg-gradient-to-br from-pink-50 to-white hover:border-pink-400 hover:shadow-pink-200/60", description: "Organize projects and tasks." },
];

const Tools = () => {
  const [searchParams] = useSearchParams();
  const courseName = searchParams.get("course") || "Your Course";

  const groupedTools = useMemo(() => [
    {
      title: "Create & Design",
      items: toolItems.filter((tool) => ["Canva", "Figma", "Adobe Photoshop", "Adobe Illustrator"].includes(tool.name)),
    },
    {
      title: "Writing & Planning",
      items: toolItems.filter((tool) => ["ChatGPT", "Google Docs", "Notion", "Jasper AI", "Perplexity AI"].includes(tool.name)),
    },
    {
      title: "Marketing & Analytics",
      items: toolItems.filter((tool) => ["Meta Business Suite", "Google Analytics", "Mailchimp", "HubSpot", "WordPress"].includes(tool.name)),
    },
    {
      title: "Collaboration & Data",
      items: toolItems.filter((tool) => ["Google Sheets", "Microsoft Excel", "Google Slides", "Trello", "Slack", "Miro", "Asana", "Google Gemini"].includes(tool.name)),
    },
  ], []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-7 font-poppins">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="space-y-2 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-logo-blue/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-logo-blue font-poppins">
            <Wrench className="h-3.5 w-3.5" />
            Student Tools
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 font-poppins">Tools for {courseName}</h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-poppins">
            Choose a tool to open it in a new tab. These are grouped to help you build, design, write, and promote your project.
          </p>
        </div>

        <Button asChild variant="outline" className="w-full sm:w-auto sm:self-center border-slate-200 text-slate-700 hover:bg-slate-50 font-poppins text-sm">
          <Link to="/forensic-app/resume?recruiterEye=true">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recruiter&apos;s Eye
          </Link>
        </Button>
      </div>

      {groupedTools.map((group) => (
        <section key={group.title} className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-poppins text-center">{group.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {group.items.map((tool) => (
              <a
                key={tool.name}
                href={tool.href}
                target="_blank"
                rel="noreferrer"
                className={`group rounded-xl border p-3 sm:p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${tool.cardClass}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black shadow-sm ring-2 ring-white/80 ${tool.badgeClass}`}>
                    {tool.badge}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-xs sm:text-sm font-bold text-slate-900 group-hover:text-logo-blue transition-colors font-poppins">{tool.name}</h3>
                        <p className="mt-1 text-[11px] sm:text-xs leading-5 text-slate-500 font-poppins line-clamp-2">{tool.description}</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-logo-gold shrink-0 mt-1" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Tools;
