import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { WaitingListForm } from "@/components/WaitingListForm";
import Footer from "@/components/Footer";

const UpcomingEvents = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Upcoming Events Section */}
      <section className="py-4 sm:py-6 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <p className="text-sm text-foreground">
                Join us for our upcoming cohorts and learning experiences
              </p>
            </div>

            {/* Events List */}
            <div className="space-y-6 mb-8">
              {/* Event 1 */}
              <div className="p-6 rounded-lg border border-logo-blue/20 bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-logo-blue mb-2">
                      June to July AI-incubator
                    </h3>
                    <p className="text-sm text-foreground mb-4">
                      Join our 4-week virtual AI incubator for beginners. Learn to build AI-powered applications and turn your ideas into working MVPs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Dialog>
              <div className="space-y-3 text-center">
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white font-bold"
                  >
                    Register to join <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </div>

              <DialogContent>
                <DialogTitle>Join Our Upcoming Cohort</DialogTitle>
                <WaitingListForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UpcomingEvents;
