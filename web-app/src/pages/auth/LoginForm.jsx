import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AtSignIcon, Eye, EyeOff, LockIcon } from "lucide-react";
import { useState } from "react";
import { useLogin } from "@/services/auth.service";
import useUserStore from "@/stores/auth";
import { Link, useNavigate } from "react-router-dom";
import { ROLES } from "@/constants/roles";

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(5, {
    message: "Password must be at least 5 characters.",
  }),
});

export function LoginForm({ className, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const loginMutation = useLogin();

  const { setToken, setRefreshToken, setUser } = useUserStore();

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = data => {
    // Add your actual login logic here
    loginMutation.mutate(data, {
      onSuccess: response => {
        console.log("Login successful", response);
        const { token, refreshToken, user } = response.data;

        // if (user.role === ROLES.PATIENT) {
        //   setMessage("Invalid credentials");
        //   return;
        // }

        setToken(token);
        setRefreshToken(refreshToken);
        setUser(user);

        if (user.role === ROLES.ADMIN) {
          navigate("/doctors");
        }
        if (user.role === ROLES.DOCTOR) {
          navigate("/dashboard");
        }
        if (user.role === ROLES.NURSE) {
          navigate("/all-patients");
        }
      },
      onError: error => {
        console.error("Login failed", error);
        const errorMessage = error?.response?.data?.error?.message || "An error occurred.";
        setMessage(errorMessage);
        console.log(errorMessage);
      },
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        {loginMutation.isError ||
          (message && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {message}
              </AlertDescription>
            </Alert>
          ))}
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email" className="text-blue-800">
                  Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <AtSignIcon className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                    <Input id="email" type="email" className="pl-10 border-blue-200" {...field} />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel htmlFor="password" className="text-blue-800">
                    Password
                  </FormLabel>
                </div>
                <FormControl>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                    <Input
                      id="password"
                      className="pl-10 pr-10 border-blue-200"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0 text-blue-500"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-700">
          <Link
            to="/forgot-password"
            className="font-medium underline underline-offset-4 hover:text-indigo-600"
          >
            Forgotten password?
          </Link>
        </div>
      </form>
    </Form>
  );
}
