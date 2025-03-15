import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRequestPasswordResetLink, useResetPassword } from "@/services/auth.service";
import { Eye, EyeOff, Check, X, AlertTriangle, AlertCircle, CircleCheckBig } from "lucide-react";
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

export default function ResetPasswordForm({ className, ...props }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("");
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

  // Form for password reset
  const passwordForm = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
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
      // setMessage("Invalid or missing reset token. Please request a new link.");
      setMessage(
        <span>
          Invalid or missing reset token. Please request a{" "}
          <Link to="/forgot-password" className="underline">
            new link
          </Link>
          .
        </span>,
      );
    }
  }, [token]);

  const handleResetPassword = data => {
    resetPassword.mutate(
      { token, newPassword: data.password },
      {
        onSuccess: response => {
          setMessage(response.data.message);
          setIsSuccess(true);
          setTimeout(() => navigate("/"), 3000);
        },
        onError: error => {
          console.error(error);
          const errorMessage = error?.response?.data?.error || "An error occurred.";
          // setMessage(errorMessage);

          if (errorMessage === "Reset link has expired. Request a new one.") {
            setMessage(
              <span>
                Reset link has expired. Request a{" "}
                <Link to="/forgot-password" className="underline">
                  new one
                </Link>
                .
              </span>,
            );
          }
          if (errorMessage === "Token is no longer valid. Please request a new reset link.") {
            setMessage(
              <span>
                Token is no longer valid. Please request a{" "}
                <Link to="/forgot-password" className="underline">
                  new reset link
                </Link>
                .
              </span>,
            );
          }
        },
      },
    );
  };

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
          <CardDescription>Create a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-6" variant={isSuccess ? "success" : "destructive"}>
              <AlertDescription className="flex items-center gap-2">
                {isSuccess ? (
                  <CircleCheckBig className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {message}
              </AlertDescription>
            </Alert>
          )}

          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="grid gap-6">
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
                  !token ||
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

          <div className="mt-6 text-center text-sm">
            Remember your password?{" "}
            <Link to="/" className="underline underline-offset-4">
              Log in
            </Link>
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
