import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Shield,
  Upload,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Camera,
  Phone,
  Mail,
  Award,
  ExternalLink,
  Clock,
  ArrowLeft,
} from "lucide-react";

const Verification = () => {
  const [verificationStep, setVerificationStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    websiteUrl: "",

    // Professional Information
    currentTitle: "",
    organization: "",
    yearsExperience: "",
    industry: "",
    specializations: "",

    // Verification Documents
    idDocument: null as File | null,
    professionalCredentials: null as File | null,
    workPortfolio: null as File | null,

    // Social Proof
    publicProfiles: "",
    references: "",
    achievements: "",

    // Consent and Agreements
    accuracyConsent: false,
    publicDisplayConsent: false,
    continuousVerificationConsent: false,
    termsAccepted: false,
  });

  const verificationMethods = [
    {
      icon: FileText,
      title: "Document Verification",
      description:
        "Upload government ID and professional credentials for identity verification.",
      required: true,
      status: "pending",
    },
    {
      icon: Briefcase,
      title: "Professional Validation",
      description:
        "Verify employment, education, and professional achievements through official sources.",
      required: true,
      status: "pending",
    },
    {
      icon: Camera,
      title: "Video Authentication",
      description:
        "Record a brief verification video to confirm identity and prevent deepfakes.",
      required: true,
      status: "pending",
    },
    {
      icon: Phone,
      title: "Contact Verification",
      description:
        "Verify phone number and email address through secure authentication.",
      required: true,
      status: "pending",
    },
    {
      icon: User,
      title: "Social Proof",
      description:
        "Cross-reference public profiles and professional references for authenticity.",
      required: false,
      status: "optional",
    },
    {
      icon: Shield,
      title: "Continuous Monitoring",
      description:
        "Ongoing verification to maintain accuracy and detect any false claims.",
      required: true,
      status: "ongoing",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const file = event.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    if (file) {
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded for verification.`,
      });
    }
  };

  const handleSubmitVerification = () => {
    // Validate required fields
    const requiredFields = [
      "fullName",
      "email",
      "currentTitle",
      "organization",
      "accuracyConsent",
      "termsAccepted",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = formData[field as keyof typeof formData];
      return !value || value === "" || value === false;
    });

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields before submitting.",
      });
      return;
    }

    // Simulate verification submission
    toast({
      title: "Verification Submitted",
      description:
        "Your verification request has been submitted. Our team will review it within 2-3 business days.",
    });

    setVerificationStep(4); // Move to confirmation step
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Your full legal name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentTitle">Current Title *</Label>
            <Input
              id="currentTitle"
              name="currentTitle"
              value={formData.currentTitle}
              onChange={handleInputChange}
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>
          <div>
            <Label htmlFor="organization">Organization *</Label>
            <Input
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              placeholder="Company or institution name"
              required
            />
          </div>
          <div>
            <Label htmlFor="yearsExperience">Years of Experience</Label>
            <Input
              id="yearsExperience"
              name="yearsExperience"
              value={formData.yearsExperience}
              onChange={handleInputChange}
              placeholder="e.g., 5-10 years"
            />
          </div>
          <div>
            <Label htmlFor="industry">Industry/Field</Label>
            <Input
              id="industry"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              placeholder="e.g., Technology, Healthcare"
            />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="specializations">Areas of Expertise</Label>
          <Textarea
            id="specializations"
            name="specializations"
            value={formData.specializations}
            onChange={handleInputChange}
            placeholder="List your key skills and areas of expertise..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Document Upload</h3>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-6">
            <div className="text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Government ID *</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a clear photo of your driver's license, passport, or
                national ID
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e, "idDocument")}
                className="hidden"
                id="idDocument"
              />
              <Button
                onClick={() => document.getElementById("idDocument")?.click()}
                variant="outline"
              >
                Choose File
              </Button>
              {formData.idDocument && (
                <p className="text-sm text-logo-gold mt-2">
                  ✓ {formData.idDocument.name}
                </p>
              )}
            </div>
          </div>

          <div className="border-2 border-dashed border-muted rounded-lg p-6">
            <div className="text-center">
              <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Professional Credentials</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Upload certificates, diplomas, or professional licenses
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={(e) => handleFileUpload(e, "professionalCredentials")}
                className="hidden"
                id="professionalCredentials"
              />
              <Button
                onClick={() =>
                  document.getElementById("professionalCredentials")?.click()
                }
                variant="outline"
              >
                Choose Files
              </Button>
              {formData.professionalCredentials && (
                <p className="text-sm text-logo-gold mt-2">
                  ✓ {formData.professionalCredentials.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Social Proof & References</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="publicProfiles">Public Profiles</Label>
            <Textarea
              id="publicProfiles"
              name="publicProfiles"
              value={formData.publicProfiles}
              onChange={handleInputChange}
              placeholder="List any public profiles (website, portfolio, social media) that can verify your identity and expertise..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="references">Professional References</Label>
            <Textarea
              id="references"
              name="references"
              value={formData.references}
              onChange={handleInputChange}
              placeholder="Provide contact information for 2-3 professional references who can verify your expertise..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">Verification Agreement</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="accuracyConsent"
              checked={formData.accuracyConsent}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  accuracyConsent: checked as boolean,
                }))
              }
            />
            <div>
              <Label htmlFor="accuracyConsent" className="font-semibold">
                Accuracy Commitment *
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that all information provided is accurate and
                truthful. I understand that providing false information may
                result in permanent ban from the platform.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="publicDisplayConsent"
              checked={formData.publicDisplayConsent}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  publicDisplayConsent: checked as boolean,
                }))
              }
            />
            <div>
              <Label htmlFor="publicDisplayConsent" className="font-semibold">
                Public Display Consent
              </Label>
              <p className="text-sm text-muted-foreground">
                I consent to my verified forensic auditor being displayed publicly in the
                Forensic Auditor Showcase for others to discover and interact with.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="continuousVerificationConsent"
              checked={formData.continuousVerificationConsent}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  continuousVerificationConsent: checked as boolean,
                }))
              }
            />
            <div>
              <Label
                htmlFor="continuousVerificationConsent"
                className="font-semibold"
              >
                Continuous Verification *
              </Label>
              <p className="text-sm text-muted-foreground">
                I agree to periodic re-verification and understand that my
                verification status may be reviewed if any discrepancies are
                found.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  termsAccepted: checked as boolean,
                }))
              }
            />
            <div>
              <Label htmlFor="termsAccepted" className="font-semibold">
                Terms & Conditions *
              </Label>
              <p className="text-sm text-muted-foreground">
                I have read and agree to the{" "}
                <Link to="/terms" className="text-logo-blue underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-logo-blue underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-logo-gold/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-logo-gold" />
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-4">Verification Submitted!</h3>
        <p className="text-muted-foreground mb-6">
          Thank you for submitting your verification request. Our team will
          review your information and documents within 2-3 business days.
        </p>
        <div className="bg-muted/50 rounded-lg p-6">
          <h4 className="font-semibold mb-3">What happens next?</h4>
          <div className="space-y-2 text-sm text-left">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-logo-blue" />
              <span>Document review (1-2 business days)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-logo-blue" />
              <span>Contact verification (automated)</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-cyber-blue" />
              <span>Professional reference check (if provided)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-ai-accent" />
              <span>Verification badge issuance</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Button asChild variant="outline">
            <Link to="/forensic-auditor-showcase">Browse Verified Forensic Auditors</Link>
          </Button>
          <Button asChild>
            <Link to="/train-your-forensic-auditor">Continue Training</Link>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/forensic-auditor-showcase">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Showcase
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold mb-4">Forensic Auditor Verification</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get verified to showcase your expertise and build trust with the
                community. Our multi-step verification process ensures
                authenticity and prevents false information.
              </p>
            </div>

            {/* Verification Methods Overview */}
            {verificationStep === 1 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-6">
                  Our Verification Process
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {verificationMethods.map((method, index) => (
                    <Card
                      key={index}
                      className="border border-muted hover:shadow-lg transition-all"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-logo-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <method.icon className="h-4 w-4 text-logo-blue" />
                    </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">
                                {method.title}
                              </h4>
                              <Badge
                                variant={
                                  method.required ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {method.required ? "Required" : "Optional"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex items-center ${step < 4 ? "flex-1" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        verificationStep >= step
                          ? "bg-gradient-to-r from-logo-blue to-logo-gold text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          verificationStep > step ? "bg-gradient-to-r from-logo-blue to-logo-gold" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Personal Info</span>
                <span>Documents</span>
                <span>Agreement</span>
                <span>Complete</span>
              </div>
            </div>

            {/* Form Content */}
            <Card>
              <CardContent className="p-8">
                {verificationStep === 1 && renderStep1()}
                {verificationStep === 2 && renderStep2()}
                {verificationStep === 3 && renderStep3()}
                {verificationStep === 4 && renderStep4()}

                {/* Navigation Buttons */}
                {verificationStep < 4 && (
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setVerificationStep(Math.max(1, verificationStep - 1))
                      }
                      disabled={verificationStep === 1}
                    >
                      Previous
                    </Button>
                    {verificationStep < 3 ? (
                      <Button
                        onClick={() =>
                          setVerificationStep(verificationStep + 1)
                        }
                        className="bg-gradient-to-r from-logo-blue to-logo-gold text-white"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitVerification}
                        className="bg-gradient-to-r from-logo-blue to-logo-gold text-white"
                      >
                        Submit for Verification
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Verification;
