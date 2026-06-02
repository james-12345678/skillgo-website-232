import { WaitingListForm } from "@/components/WaitingListForm";
import Footer from "@/components/Footer";

const RegisterWaitingList = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Course Details Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-logo-blue mb-2">
                Join the AI Incubator
              </h1>
              <h2 className="text-base sm:text-lg font-bold text-logo-blue mb-3">
                Applied AI Product Engineering Short Course
              </h2>
              <p className="text-sm text-foreground">
                4-week virtual AI incubator for beginners
              </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Key Skills Gained */}
              <div className="p-6 rounded-lg border border-logo-blue/20 bg-gradient-to-br from-logo-blue/5 to-transparent hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-logo-blue mb-4 text-center">Key skills gained</h3>
                <ul className="space-y-2">
                  <li className="flex gap-2 text-sm">
                    <span className="text-logo-blue font-bold flex-shrink-0">•</span>
                    <span className="text-foreground">Use AI tools to build real, working applications</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <span className="text-logo-blue font-bold flex-shrink-0">•</span>
                    <span className="text-foreground">Turn ideas into MVPs using your skills</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <span className="text-logo-blue font-bold flex-shrink-0">•</span>
                    <span className="text-foreground">Automate workflows and integrate AI (OpenAI, Airtable, Make)</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <span className="text-logo-blue font-bold flex-shrink-0">•</span>
                    <span className="text-foreground">Build, deploy, and prove your work with SkillGo Engine</span>
                  </li>
                </ul>
              </div>

              {/* Final Outcome */}
              <div className="p-6 rounded-lg border border-logo-gold/20 bg-gradient-to-br from-logo-gold/5 to-transparent hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-logo-gold mb-4 text-center">Final outcome</h3>
                <ul className="space-y-2">
                  <li className="flex gap-2 text-sm">
                    <span className="text-logo-gold font-bold flex-shrink-0">•</span>
                    <span className="text-foreground">A working AI-powered product</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <span className="text-logo-gold font-bold flex-shrink-0">•</span>
                    <span className="text-foreground">A real-world MVP from your own idea</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <span className="text-logo-gold font-bold flex-shrink-0">•</span>
                    <span className="text-foreground">A verified proof link showing your execution</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <span className="text-logo-gold font-bold flex-shrink-0">•</span>
                    <span className="text-foreground">A portfolio-ready project you can show employers or users</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tools you will use */}
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 mb-8 text-center">
              <h3 className="text-base font-bold text-foreground mb-3">Tools you will use</h3>
              <p className="text-sm text-foreground font-semibold mb-2">
                Firebase · Make · OpenAI · Webflow
              </p>
              <p className="text-xs text-foreground/75">
                Build → Test → Prove with SkillGo Engine
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-950 p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
                Enroll for the Next Cohort
              </h2>
              <p className="text-sm text-foreground/70 text-center mb-6">
                Fill in your details to get started
              </p>
              <WaitingListForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RegisterWaitingList;
