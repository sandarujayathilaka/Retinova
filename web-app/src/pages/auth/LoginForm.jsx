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

  const { setToken, setUser } = useUserStore();

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
        const { token, user } = response.data;

        if (user.role === "customer") {
          setMessage("Invalid credentials");
          return;
        }

        setToken(token);
        setUser(user);

        navigate("/dashboard");
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
        {loginMutation.isError && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {message}
            </AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email" className="text-black/80">
                  Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <AtSignIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      // placeholder="m@example.com"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel htmlFor="password" className="text-black/80">
                    Password
                  </FormLabel>
                  {/* <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </a> */}
                </div>
                <FormControl>
                  {/* <Input id="password" type="password" {...field} /> */}
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      className="pl-10 pr-10"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Login..." : "Login"}
          </Button>
        </div>

        <div className="text-center text-sm">
          <Link
            to="/forgot-password"
            className="ml-auto text-sm underline-offset-4 hover:underline"
          >
            Forgotten password?
          </Link>
        </div>
      </form>
    </Form>
  );
}
