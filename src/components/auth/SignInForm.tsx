import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail, validatePassword } from "@/lib/validation";
import { EmailValidationMessages, PasswordValidationMessages } from "@/components/ValidationMessages";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";

const SignInForm = () => {
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [email, setEmail] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('pending_user_email') ||
        localStorage.getItem('remember_email') ||
        ''
      );
    } catch (e) {
      return '';
    }
  });
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try { return !!localStorage.getItem('remember_email'); } catch { return false; }
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

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

  // If AuthProvider already has a user and email empty, prefill
  useEffect(() => {
    try {
      if (!email && user?.email) setEmail(user.email);
      const pending = localStorage.getItem('pending_user_email');
      if (pending && pending !== email) setEmail(pending);
    } catch (e) {}
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const requestBody = {
        Email: email.trim(),
        Password: password,
      };

      const response = await apiFetch('api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      let responseData;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = { message: await response.text() };
        }
      } catch (e) {
        responseData = { message: 'Failed to parse server response.' };
      }

      // Handle common auth errors directly
      if (!response.ok) {
        let serverMsg = responseData?.message || responseData?.error || responseData?.title || responseData?.statusText;

        // More robust error extraction for ASP.NET / Identity / FluentValidation
        if (responseData?.errors && typeof responseData.errors === 'object') {
          const errorList: string[] = [];
          Object.keys(responseData.errors).forEach(key => {
            const err = responseData.errors[key];
            if (Array.isArray(err)) errorList.push(...err);
            else if (typeof err === 'string') errorList.push(err);
            else if (err && typeof err === 'object') {
              // Handle nested validation errors
              Object.values(err).forEach(val => {
                if (typeof val === 'string') errorList.push(val);
                else if (Array.isArray(val)) errorList.push(...val.filter(v => typeof v === 'string'));
              });
            }
          });
          if (errorList.length > 0) serverMsg = errorList.join('\n');
        }

        // If still no message, use full response as string for debugging
        if (!serverMsg && response.status === 400) {
          serverMsg = JSON.stringify(responseData);
        }

        if (response.status === 401 || response.status === 403) {
          // Check if the account is unconfirmed. Backends often return a specific message or code.
          const isUnconfirmed = serverMsg?.toLowerCase().includes('confirm') ||
                               serverMsg?.toLowerCase().includes('verify');

          if (isUnconfirmed) {
            setError('Please confirm your email address before logging in. We sent a link to your inbox.');
            setNeedsConfirmation(true);
          } else {
            setError(serverMsg || 'Invalid email or password. Please check your credentials.');
          }
        } else if (response.status === 400) {
          setError(serverMsg || 'Invalid request. Please check your inputs.');
        } else {
          // No more silent fallback to mock login for general errors
          setError(serverMsg || `Login failed (${response.status}). Please try again later.`);
        }
        return;
      }

      // Success path
      const token = responseData?.token || responseData?.accessToken || responseData?.access_token || responseData?.jwt || responseData?.data?.token || responseData?.result?.token;
      if (token) {
        console.log('SignInForm: Setting auth_token', {
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + '...',
          responseKeys: Object.keys(responseData)
        });
        localStorage.setItem('auth_token', token);
      } else {
        console.warn('SignInForm: No token found in response', { responseData, responseKeys: Object.keys(responseData) });
      }

      const nameFromServer = responseData?.name || responseData?.fullName || responseData?.full_name || [responseData?.firstName, responseData?.lastName].filter(Boolean).join(' ') || responseData?.user?.name;
      if (nameFromServer) localStorage.setItem('pending_user_name', nameFromServer);
      localStorage.setItem('pending_user_email', email);

      try {
        if (rememberMe) localStorage.setItem('remember_email', email);
        else localStorage.removeItem('remember_email');
      } catch (e) {}

      const rawRole = responseData?.role || responseData?.user?.role || (email.toLowerCase().includes('admin') ? 'admin' : 'user');
      const role = String(rawRole).toLowerCase();
      await login(email, password, undefined, role as 'admin' | 'user');
      setSuccess("Login successful! Redirecting...");
      if (role === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/forensic-app");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("A network error occurred. Please check your connection and try again.");
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) return;

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiFetch('api/Auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email.trim() }),
      });

      if (response.ok) {
        setSuccess("A new confirmation email has been sent. Please check your inbox.");
        setNeedsConfirmation(false);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Failed to resend confirmation email. Please try again later.");
      }
    } catch (err) {
      setError("A network error occurred while trying to resend the email.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Error and Success Messages */}
      {error && (
        <div className="mb-2 p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg whitespace-pre-wrap flex flex-col gap-2">
          <span>{error}</span>
          {needsConfirmation && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResendConfirmation}
              disabled={isResending}
              className="mt-1 h-7 text-[10px] bg-white border-red-200 hover:bg-red-50 text-red-700 font-semibold"
            >
              {isResending ? "Sending..." : "Resend Confirmation Email"}
            </Button>
          )}
        </div>
      )}
      {success && (
        <div className="mb-2 p-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="loginEmail" className="text-sm font-semibold">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="loginEmail"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className="pl-10"
              autoComplete="off"
              required
            />
          </div>
          {emailTouched && <EmailValidationMessages validation={emailValidation} showMessages={true} />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="loginPassword" className="text-sm font-semibold">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="loginPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordTouched(true)}
              className="pl-10 pr-10"
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
          {passwordTouched && password.length > 0 && <PasswordValidationMessages validation={passwordValidation} showMessages={true} />}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="rememberMe" className="text-sm cursor-pointer font-medium">
              Remember me
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-logo-blue to-logo-gold hover:from-logo-blue/90 hover:to-logo-gold/90 text-white font-bold py-6 shadow-lg transition-all duration-200"
        >
          <span className="flex items-center justify-center gap-2 w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </span>
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Don't have an account?{" "}
        <Button
          variant="link"
          onClick={() => navigate("/signup")}
          className="p-0 h-auto text-logo-blue hover:text-logo-blue/80 text-xs"
        >
          Sign up here
        </Button>
      </div>
    </div>
  );
};

export default SignInForm;
