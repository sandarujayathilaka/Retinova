import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRequestPasswordResetLink } from "@/services/auth.service";
import { AlertCircle, AtSignIcon, CircleCheckBig } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const ResendEmailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export default function ForgotPasswordForm({ className, ...props }) {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const requestResetLink = useRequestPasswordResetLink();

  // Form for email resend
  const emailForm = useForm({
    resolver: zodResolver(ResendEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleResendResetLink = data => {
    requestResetLink.mutate(data.email, {
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

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div>
        <div className="mb-8 flex flex-col gap-4">
          <div className="text-2xl font-bold text-blue-950">Reset your password</div>
          <p className="text-sm text-gray-600">
            Enter your email address and we will send you a link to reset your password.
          </p>
        </div>
        <div>
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

          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleResendResetLink)} className="grid gap-6">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-800">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSignIcon className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                        <Input
                          type="email"
                          placeholder="Your email address"
                          className="pl-10 border-blue-200"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={requestResetLink.isPending}
              >
                {requestResetLink.isPending ? "Sending..." : "Send password reset email"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-blue-800">
            Remember your password?{" "}
            <Link
              to="/"
              className="font-medium underline underline-offset-4 text-blue-600 hover:text-indigo-600"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
      {/* <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By resetting your password, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div> */}
    </div>
  );
}
