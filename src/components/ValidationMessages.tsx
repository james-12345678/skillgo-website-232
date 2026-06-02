import React from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { EmailValidationResult, PasswordValidationResult } from "@/lib/validation";

interface EmailValidationMessagesProps {
  validation: EmailValidationResult;
  showMessages: boolean;
}

export const EmailValidationMessages: React.FC<EmailValidationMessagesProps> = ({
  validation,
  showMessages,
}) => {
  if (!showMessages || validation.isValid) return null;

  return (
    <div className="mt-1 space-y-1">
      {validation.errors.map((error, index) => (
        <div key={index} className="flex items-center gap-1.5 text-[10px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ))}
    </div>
  );
};

interface PasswordValidationMessagesProps {
  validation: PasswordValidationResult;
  showMessages: boolean;
}

export const PasswordValidationMessages: React.FC<PasswordValidationMessagesProps> = ({
  validation,
  showMessages,
}) => {
  if (!showMessages) return null;

  return (
    <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 p-2 bg-slate-50 rounded-md border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
      {Object.entries(validation.rules).map(([key, rule]) => (
        <div
          key={key}
          className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors duration-200 ${
            rule.isValid ? "text-green-600" : "text-slate-500"
          }`}
        >
          {rule.isValid ? (
            <Check className="h-3 w-3 flex-shrink-0" />
          ) : (
            <X className="h-3 w-3 flex-shrink-0 opacity-50" />
          )}
          <span>{rule.message}</span>
        </div>
      ))}
    </div>
  );
};

interface PasswordMatchMessagesProps {
  password?: string;
  confirmPassword?: string;
  showMessages: boolean;
}

export const PasswordMatchMessages: React.FC<PasswordMatchMessagesProps> = ({
  password,
  confirmPassword,
  showMessages,
}) => {
  if (!showMessages || !password || !confirmPassword) return null;

  const passwordsMatch = password === confirmPassword;
  if (passwordsMatch) return null;

  return (
    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      <span>Passwords do not match</span>
    </div>
  );
};
