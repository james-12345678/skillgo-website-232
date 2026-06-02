import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiFetch } from "@/lib/api";
import { validateEmail, validatePassword } from "@/lib/validation";
import { EmailValidationMessages, PasswordValidationMessages, PasswordMatchMessages } from "@/components/ValidationMessages";
import {
  ArrowRight,
  Mail,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const SignUpForm = () => {
  const navigate = useNavigate();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [agreeToTermsTouched, setAgreeToTermsTouched] = useState(false);

  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const isPasswordMatch = password === confirmPassword;

  const getDetailedErrorMessage = (validationType: 'email') => {
    if (validationType === 'email') {
      return (
        "Email must:\n" +
        "• Be a valid email address (format: example@domain.com)\n" +
        "• Contain at least one lowercase letter"
      );
    }
    return "";
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!emailValidation.isValid) {
      setError(getDetailedErrorMessage('email'));
      setIsLoading(false);
      return;
    }

    if (!passwordValidation.isValid) {
      setError("Please ensure your password meets all requirements.");
      setIsLoading(false);
      return;
    }

    if (!isPasswordMatch) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms of service");
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiFetch('api/Auth/self-register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          FirstName: firstName.trim(),
          LastName: lastName.trim(),
          Email: email.trim(),
          PhoneNumber: phoneNumber.trim(),
          Password: password,
          ConfirmPassword: confirmPassword,
        }),
      });

      if (response.status === 404) {
        setError('Registration API endpoint not found. Please contact support.');
        setIsLoading(false);
        return;
      }

      let responseData;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch (jsonError) {
          setError('Invalid JSON response from server.');
          setIsLoading(false);
          return;
        }
      } else {
        // Handle non-JSON responses (like HTML error pages)
        if (response.ok) {
          setSuccess("Registration successful! Please check your email for your password. Redirecting to sign in...");
          setTimeout(() => navigate("/signin"), 1500);
          setIsLoading(false);
          return;
        } else {
          setError(`Server error (${response.status}). Please contact support.`);
          setIsLoading(false);
          return;
        }
      }

      if (response.ok) {
        localStorage.setItem('pending_user_name', `${firstName} ${lastName}`.trim());
        localStorage.setItem('pending_user_email', email);
        setSuccess("Registration successful! Please check your email to confirm your account.");
        setTimeout(() => navigate("/signup-success"), 1500);
      } else {
        // Return API error message directly - check multiple possible field names
        let errorMsg = responseData?.message ||
                       responseData?.error ||
                       responseData?.title ||
                       responseData?.detail ||
                       (typeof responseData === 'string' ? responseData : null) ||
                       `Registration failed (${response.status}). Please try again.`;
        setError(errorMsg);
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      {/* Error and Success Messages */}
      {error && (
        <div className="mb-2 p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg whitespace-pre-wrap">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-2 p-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-3 sm:space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="signupFirstName" className="text-sm font-semibold">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signupFirstName"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-10 h-10 sm:h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="signupLastName" className="text-sm font-semibold">Last Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="signupLastName"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-10 h-10 sm:h-11"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="signupEmail" className="text-sm font-semibold">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signupEmail"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className="pl-10 h-10 sm:h-11"
              autoComplete="off"
              required
            />
          </div>
          {emailTouched && <EmailValidationMessages validation={emailValidation} showMessages={true} />}
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="signupPhoneNumber" className="text-sm font-semibold">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signupPhoneNumber"
              type="tel"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="pl-10 h-10 sm:h-11"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="signupPassword" className="text-sm font-semibold">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signupPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordTouched(true)}
              className="pl-10 h-10 sm:h-11"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent min-w-[44px]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {passwordTouched && <PasswordValidationMessages validation={passwordValidation} showMessages={true} />}
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="signupConfirmPassword" className="text-sm font-semibold">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signupConfirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmPasswordTouched(true)}
              className="pl-10 h-10 sm:h-11"
              required
            />
          </div>
          {confirmPasswordTouched && <PasswordMatchMessages password={password} confirmPassword={confirmPassword} showMessages={true} />}
        </div>


        <div className="flex items-center space-x-2 py-1">
          <Checkbox
            id="agreeToTerms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            onBlur={() => setAgreeToTermsTouched(true)}
          />
          <Label htmlFor="agreeToTerms" className="text-sm cursor-pointer font-medium">
            I agree to{" "}
            <a href="/terms" className="text-logo-blue hover:underline">
              Terms
            </a>
          </Label>
        </div>
        {agreeToTermsTouched && !agreeToTerms && (
          <p className="text-xs text-red-500 font-medium">Please agree to the terms to proceed</p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white font-bold py-4 sm:py-5 shadow-lg transition-all duration-200"
        >
          <span className="flex items-center justify-center gap-2 w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </span>
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Button
          variant="link"
          onClick={() => navigate("/signin")}
          className="p-0 h-auto text-logo-blue hover:text-logo-blue/80 text-xs"
        >
          Sign in here
        </Button>
      </div>
    </div>
  );
};

export default SignUpForm;
