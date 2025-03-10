"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useResendResetLink, useResetPassword } from "@/services/auth.service";
import { Eye, EyeOff, Check, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Validation schema for password reset
const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Validation schema for email resend
const ResendEmailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export function ResetPasswordForm({ className, ...props }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("");
  const [showResendForm, setShowResendForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation states
  const [passwordCriteria, setPasswordCriteria] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const resetPassword = useResetPassword();
  const resendResetLink = useResendResetLink();

  // Form for password reset
  const passwordForm = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Form for email resend
  const emailForm = useForm({
    resolver: zodResolver(ResendEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Check password criteria
  const checkPasswordCriteria = password => {
    setPasswordCriteria({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    });
  };

  // Watch for password changes
  useEffect(() => {
    const subscription = passwordForm.watch((value, { name }) => {
      if (name === "password" || name === undefined) {
        checkPasswordCriteria(value.password || "");
      }
    });

    return () => subscription.unsubscribe();
  }, [passwordForm.watch]);

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing reset token. Please request a new link.");
      setShowResendForm(true);
    }
  }, [token]);

  const handleResetPassword = data => {
    resetPassword.mutate(
      { token, newPassword: data.password },
      {
        onSuccess: response => {
          setMessage(response.data.message);
          setIsSuccess(true);
          setTimeout(() => navigate("/login"), 3000);
        },
        onError: error => {
          console.error(error);
          const errorMessage = error?.response?.data?.error || "An error occurred.";
          setMessage(errorMessage);

          if (errorMessage === "Reset link has expired. Request a new one.") {
            setShowResendForm(true);
          }
        },
      },
    );
  };

  const handleResendResetLink = data => {
    resendResetLink.mutate(data.email, {
      onSuccess: response => {
        setMessage(response.data.message);
        setIsSuccess(true);
        // setShowResendForm(false);
      },
      onError: error => {
        console.error(error);
        const errorMessage = error?.response?.data?.error || "Error sending reset link.";
        setMessage(errorMessage);
      },
    });
  };

  // Reset forms when switching between them
  useEffect(() => {
    if (showResendForm) {
      emailForm.reset();
    } else {
      passwordForm.reset();
      setPasswordCriteria({
        hasMinLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
    }
  }, [showResendForm, emailForm, passwordForm]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Helper to display validation item
  const ValidationItem = ({ fulfilled, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {fulfilled ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-gray-400" />
      )}
      <span className={fulfilled ? "text-green-700" : "text-gray-500"}>{text}</span>
    </div>
  );

  // Check if all password criteria are met
  const allCriteriaMet = Object.values(passwordCriteria).every(criterion => criterion === true);

  // Check if passwords match
  const passwordsMatch = passwordForm.watch("confirmPassword") === passwordForm.watch("password");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>
            {showResendForm
              ? "Request a new password reset link"
              : "Create a new password for your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className={cn("mb-6", isSuccess ? "bg-green-50" : "bg-red-50")}>
              <AlertTitle>{isSuccess ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {!showResendForm && (
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(handleResetPassword)}
                className="grid gap-6"
              >
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      {/* We're intentionally not showing the default FormMessage here */}

                      {/* Password criteria checklist */}
                      <div className="mt-3 space-y-2 rounded-md bg-gray-50 p-3">
                        <ValidationItem
                          fulfilled={passwordCriteria.hasMinLength}
                          text="At least 8 characters"
                        />
                        <ValidationItem
                          fulfilled={passwordCriteria.hasUppercase}
                          text="At least one uppercase letter"
                        />
                        <ValidationItem
                          fulfilled={passwordCriteria.hasLowercase}
                          text="At least one lowercase letter"
                        />
                        <ValidationItem
                          fulfilled={passwordCriteria.hasNumber}
                          text="At least one number"
                        />
                        <ValidationItem
                          fulfilled={passwordCriteria.hasSpecialChar}
                          text="At least one special character"
                        />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                            onClick={toggleConfirmPasswordVisibility}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showConfirmPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      {/* We're intentionally not showing the default FormMessage here */}

                      {/* Password match indicator - always shown when confirm password has value */}
                      {field.value && (
                        <div className="mt-3 space-y-2 rounded-md bg-gray-50 p-3">
                          <ValidationItem
                            fulfilled={field.value === passwordForm.watch("password")}
                            text="Passwords match"
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    resetPassword.isPending ||
                    !allCriteriaMet ||
                    !passwordsMatch ||
                    !passwordForm.watch("confirmPassword")
                  }
                >
                  {resetPassword.isPending ? "Processing..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          )}

          {showResendForm && (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleResendResetLink)} className="grid gap-6">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="m@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={resendResetLink.isPending}>
                  {resendResetLink.isPending ? "Sending..." : "Send New Reset Link"}
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-6 text-center text-sm">
            Remember your password?{" "}
            <a href="/login" className="underline underline-offset-4">
              Log in
            </a>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By resetting your password, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

export default ResetPasswordForm;
