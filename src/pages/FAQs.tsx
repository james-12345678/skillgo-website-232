import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

const faqs = [
  {
    question: "Will Skillgo actually help me earn income, or is it just another learning platform?",
    answer: (
      <>
        <p className="mb-3">
          Skillgo is not built for passive learning. It is designed to help you build, prove, and present real skills.
        </p>
        <p>
          Instead of just completing courses, you create evidence backed work that shows what you can do, so you can confidently approach jobs or clients.
        </p>
      </>
    ),
  },
  {
    question: "I already have a degree. Why do I still need Skillgo?",
    answer: (
      <>
        <p className="mb-3">
          Your degree proves you studied. Skillgo helps you prove you can deliver results.
        </p>
        <p>
          Employers and clients are no longer asking, “What did you learn?” They are asking, “What can you do?” Skillgo bridges that gap.
        </p>
      </>
    ),
  },
  {
    question: "What if I don’t have any experience or portfolio yet?",
    answer: (
      <>
        <p className="mb-3">
          That’s exactly who Skillgo is for. You don’t start with experience. You build it.
        </p>
        <p>
          Skillgo guides you to create practical projects that become your first real portfolio.
        </p>
      </>
    ),
  },
  {
    question: "How does Skillgo verify that my skills are real?",
    answer: (
      <>
        <p className="mb-3">
          Skillgo focuses on evidence, not claims. Instead of just saying you have a skill, you submit real work, projects, or outputs.
        </p>
        <p>
          These are analyzed and structured into a clear, verifiable profile that others can trust.
        </p>
      </>
    ),
  },
  {
    question: "What is “Recruiter’s Eye,” and why does it matter?",
    answer: (
      <>
        <p className="mb-3">
          Recruiter’s Eye shows you what the market actually expects. Instead of guessing what to learn, you see the skills in demand, the tools being used, and the type of work that proves capability.
        </p>
        <p>
          This helps you focus only on what gets you hired or paid.
        </p>
      </>
    ),
  },
  {
    question: "Do I need to be tech-savvy to use Skillgo?",
    answer: (
      <>
        <p className="mb-3">
          No. Skillgo is built for graduates and beginners who are still figuring things out. You only need basic computer skills, willingness to learn, and consistency.
        </p>
        <p>
          Everything else builds step by step.
        </p>
      </>
    ),
  },
  {
    question: "How long do I take to be recognized by the recruiter",
    answer: (
      <>
        <p>
          It depends on consistency and your ability to prove your unique skills to the recruiter in the era of AI by showing your thought process.
        </p>
      </>
    ),
  },
  {
    question: "What if I learn a skill but still don’t get opportunities?",
    answer: (
      <>
        <p className="mb-3">
          This usually happens when skills are not aligned with market demand or there is no proof of ability.
        </p>
        <p>
          Skillgo solves both: you learn what matters, and you build evidence to back it up.
        </p>
      </>
    ),
  },
  {
    question: "Can I use Skillgo while still applying for jobs?",
    answer: (
      <>
        <p className="mb-3">
          Yes, and you should. Use your degree to apply, and use Skillgo to stand out and earn in the meantime.
        </p>
        <p>
          This puts you in a stronger position. You’re not just waiting, you’re progressing.
        </p>
      </>
    ),
  },
  {
    question: "What makes Skillgo different from other platforms?",
    answer: (
      <>
        <p className="mb-3">
          Skillgo is built around one idea: skills should be proven, not just learned. It combines market insight, practical output, and verification.
        </p>
        <p>
          So instead of guessing your path, you move with direction and evidence.
        </p>
      </>
    ),
  },
];

const FAQs = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-8 sm:py-10">
        <div className="absolute inset-0 bg-gradient-to-br from-logo-blue/10 via-background to-logo-gold/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.border)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border)_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-10" />

        <div className="container relative mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-start mb-4">
              <BackButton fallbackPath="/marketing" className="rounded-full border border-logo-blue/10 bg-background/80 px-4 py-2 shadow-sm hover:bg-logo-blue/5" />
            </div>

            <div className="mb-6 text-center">
              <div className="inline-flex items-center rounded-full bg-gradient-to-r from-logo-blue to-logo-gold px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-logo-blue/20 mb-3">
                Support Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                FAQs
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-foreground/70 leading-relaxed">
                Answers to the most common questions about how Skillgo helps you build proof, stand out, and move toward earning.
              </p>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
              <Card className="h-full overflow-hidden rounded-2xl border border-logo-blue/10 bg-background/95 shadow-md ring-1 ring-logo-blue/5">
                <CardContent className="flex h-full flex-col p-0">
                  <Accordion type="single" collapsible className="w-full flex-1">
                    {faqs.slice(0, 5).map((faq, index) => (
                      <AccordionItem
                        key={faq.question}
                        value={`faq-${index + 1}`}
                        className="border-b border-logo-blue/10 px-5 last:border-b-0 sm:px-6"
                      >
                        <AccordionTrigger className="gap-3 py-4 text-left text-xs font-medium text-foreground hover:no-underline hover:text-logo-blue sm:text-sm data-[state=open]:text-logo-blue">
                          <span className="mr-3 flex-shrink-0 text-logo-blue font-medium">{index + 1}.</span>
                          <span className="flex-1">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 pl-8 text-sm leading-7 text-foreground/70">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              <Card className="h-full overflow-hidden rounded-2xl border border-logo-gold/10 bg-background/95 shadow-md ring-1 ring-logo-gold/5">
                <CardContent className="flex h-full flex-col p-0">
                  <Accordion type="single" collapsible className="w-full flex-1">
                    {faqs.slice(5).map((faq, index) => (
                      <AccordionItem
                        key={faq.question}
                        value={`faq-${index + 6}`}
                        className="border-b border-logo-gold/10 px-5 last:border-b-0 sm:px-6"
                      >
                        <AccordionTrigger className="gap-3 py-4 text-left text-xs font-medium text-foreground hover:no-underline hover:text-logo-gold sm:text-sm data-[state=open]:text-logo-gold">
                          <span className="mr-3 flex-shrink-0 text-logo-gold font-medium">{index + 6}.</span>
                          <span className="flex-1">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 pl-8 text-sm leading-7 text-foreground/70">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQs;
