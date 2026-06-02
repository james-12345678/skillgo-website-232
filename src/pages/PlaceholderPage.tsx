import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { Construction, ArrowLeft } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-logo-blue/20 to-logo-blue/40 mb-8">
              <Construction className="h-10 w-10 text-logo-blue" />
            </div>

            <h1 className="text-lg font-bold mb-4">{title}</h1>
            <p className="text-sm text-muted-foreground mb-8">{description}</p>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                This page is coming soon. We're working hard to bring you the
                complete SkillGo experience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link to="/forensic-app" className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </Button>

                <Button
                  asChild
                  className="bg-gradient-to-r from-logo-blue to-logo-blue text-white hover:scale-105 transition-all duration-300"
                >
                  <Link to="/forensic-app">Audit Your Work</Link>
                </Button>
              </div>
            </div>

            <div className="mt-12 p-6 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">
                Lost? Try exploring our{" "}
                <Link
                  to="/about"
                  className="text-logo-blue hover:underline font-medium"
                >
                  About Us
                </Link>{" "}
                or{" "}
                <Link
                  to="/contact"
                  className="text-logo-blue hover:underline font-medium"
                >
                  Contact
                </Link>{" "}
                to learn more about SkillGo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PlaceholderPage;
