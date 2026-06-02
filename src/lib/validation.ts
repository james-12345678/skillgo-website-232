export interface ValidationRule {
  isValid: boolean;
  message: string;
}

export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordValidationResult {
  isValid: boolean;
  rules: {
    minLength: ValidationRule;
    hasUpperCase: ValidationRule;
    hasLowerCase: ValidationRule;
    hasNumber: ValidationRule;
    hasSpecialChar: ValidationRule;
  };
  allRulesMet: boolean;
}

export const validateEmail = (email: string): EmailValidationResult => {
  const errors: string[] = [];

  if (!email.trim()) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Please enter a valid email address (format: example@domain.com)");
    }

    if (!/[a-z]/.test(email)) {
      errors.push("Email must contain at least one lowercase letter");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePassword = (password: string): PasswordValidationResult => {
  const rules = {
    minLength: {
      isValid: password.length >= 8,
      message: "At least 8 characters",
    },
    hasUpperCase: {
      isValid: /[A-Z]/.test(password),
      message: "At least one uppercase letter (A-Z)",
    },
    hasLowerCase: {
      isValid: /[a-z]/.test(password),
      message: "At least one lowercase letter (a-z)",
    },
    hasNumber: {
      isValid: /[0-9]/.test(password),
      message: "At least one number (0-9)",
    },
    hasSpecialChar: {
      isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      message: "At least one special character (!@#$%^&*)",
    },
  };

  const allRulesMet = Object.values(rules).every((rule) => rule.isValid);

  return {
    isValid: allRulesMet,
    rules,
    allRulesMet,
  };
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: "Passwords do not match",
    };
  }

  return {
    isValid: true,
  };
};
