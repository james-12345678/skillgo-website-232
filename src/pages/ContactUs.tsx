import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Users, Building2, Briefcase } from "lucide-react";

const contactMethods = [
  {
    label: "Call us",
    value: "+254 116 351571",
    icon: Phone,
  },
  {
    label: "Email us",
    value: "info@skillgo.africa",
    icon: Mail,
  },
];

const audiences = [
  "Graduates ready to turn knowledge into income",
  "Job seekers who want to stand out with proof",
  "Beginners building real, practical skills",
  "Freelancers looking to validate their work",
  "Mentors who want to guide and shape real talent",
];

const partnerTypes = [
  {
    title: "A company",
    icon: Building2,
  },
  {
    title: "An organization",
    icon: Briefcase,
  },
  {
    title: "An industry expert",
    icon: Users,
  },
];

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-logo-blue/[0.03] via-background to-logo-gold/[0.05]">
      <div className="container mx-auto px-4 pt-6">
        <BackButton fallbackPath="/" />
      </div>

      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border bg-background/60 px-4 py-2 text-sm font-medium text-foreground/80 backdrop-blur-sm mb-6">
              Contact SkillGo
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-br from-logo-blue to-logo-gold bg-clip-text text-transparent">
                Get in Touch
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base text-muted-foreground mb-4 leading-relaxed font-light">
              Have questions or want to be part of building real, verifiable skills?
            </p>

            <p className="text-lg font-medium text-foreground">Let’s connect.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-logo-blue/5 via-background to-logo-gold/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-foreground mb-12">
              Contact Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {contactMethods.map((method) => {
                const Icon = method.icon;

                return (
                  <Card
                    key={method.label}
                    className="border border-logo-blue/20 bg-background/95 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-logo-gold/40 hover:shadow-xl"
                  >
                    <CardContent className="p-8 text-center h-full">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-logo-blue/20 to-logo-blue/40 mb-6">
                        <Icon className="h-8 w-8 text-logo-blue" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-foreground">{method.label}</h3>
                      <p className="text-foreground/70 text-lg break-all">{method.value}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-foreground mb-12">
              Who can use Skillgo?
            </h2>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                {audiences.map((item, index) => (
                  <Card
                    key={item}
                    className={`border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      index % 2 === 0
                        ? "border-logo-blue/20 bg-logo-blue/5 hover:border-logo-blue/40"
                        : "border-logo-gold/30 bg-logo-gold/10 hover:border-logo-gold/50"
                    } ${
                      index === audiences.length - 1 && audiences.length % 2 === 1
                        ? "md:col-span-2 md:mx-auto md:w-full md:max-w-md"
                        : ""
                    }`}
                  >
                    <CardContent className="p-8">
                      <p className="text-foreground/80 leading-relaxed text-base">{item}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-logo-blue/5 to-logo-gold/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-foreground mb-6">
              Partners &amp; Mentors
            </h2>
            <p className="text-center text-lg text-foreground/70 mb-8">
              We’re building more than a platform—we’re building opportunity.
            </p>
            <p className="text-center text-base text-muted-foreground mb-10 leading-relaxed font-light">
              If you’re:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {partnerTypes.map((partner) => {
                const Icon = partner.icon;

                return (
                  <Card
                    key={partner.title}
                    className="border border-logo-gold/30 bg-background/95 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-logo-blue/40 hover:shadow-xl"
                  >
                    <CardContent className="p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-logo-gold/20 to-logo-gold/40 mb-6">
                        <Icon className="h-8 w-8 text-logo-gold" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{partner.title}</h3>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="max-w-3xl mx-auto text-center mt-10">
              <p className="text-base text-foreground/75 leading-relaxed">
                Partner with Skillgo to help young people build, prove, and monetize real skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-logo-blue/5 to-logo-gold/5 border-t border-logo-gold/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Start. Prove. Earn.</h2>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
