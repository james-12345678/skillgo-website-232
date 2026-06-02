import { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserEducation from "./UserEducation";
import UserExperience from "./UserExperience";
import BackButton from "@/components/BackButton";

const EducationExperience = () => {
  const educationRef = useRef<any>(null);
  const experienceRef = useRef<any>(null);

  return (
    <div className="space-y-8 overflow-x-hidden">
      <div className="flex items-center -ml-2">
        <BackButton fallbackPath="/forensic-app" />
      </div>
      <Tabs defaultValue="education" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-8 bg-slate-100/50 p-1 h-auto gap-1">
          <TabsTrigger
            value="education"
            className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-logo-blue data-[state=active]:shadow-sm group flex items-center justify-between px-4 py-2"
          >
            Education
            <span
              onClick={(e) => {
                e.stopPropagation();
                educationRef.current?.triggerAdd();
              }}
              className="text-xs font-poppins font-bold px-2.5 py-1 rounded border border-slate-200 text-slate-900 hover:text-logo-blue hover:bg-logo-blue/5 transition-all cursor-pointer shadow-sm"
              title="Add Education"
            >
              Add
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="experience"
            className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-logo-blue data-[state=active]:shadow-sm group flex items-center justify-between px-4 py-2"
          >
            Experience/Certifications
            <span
              onClick={(e) => {
                e.stopPropagation();
                experienceRef.current?.triggerAdd();
              }}
              className="text-xs font-poppins font-bold px-2.5 py-1 rounded border border-slate-200 text-slate-900 hover:text-logo-blue hover:bg-logo-blue/5 transition-all cursor-pointer shadow-sm"
              title="Add Experience/certifications"
            >
              Add
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="education" className="mt-0 focus-visible:outline-none">
          <UserEducation ref={educationRef} />
        </TabsContent>
        <TabsContent value="experience" className="mt-0 focus-visible:outline-none">
          <UserExperience ref={experienceRef} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EducationExperience;
