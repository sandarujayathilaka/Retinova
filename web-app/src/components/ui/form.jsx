import React from "react";
import { cn } from "../../lib/utils";

const Form = ({ className, children, ...props }) => (
  <form className={cn("space-y-4", className)} {...props}>
    {children}
  </form>
);

const FormItem = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium text-gray-700", className)} {...props} />
));
FormLabel.displayName = "FormLabel";

const FormControl = ({ children }) => <>{children}</>;

const FormMessage = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-red-500", className)} {...props} />
));
FormMessage.displayName = "FormMessage";

// Add FormField
const FormField = ({ control, name, render }) => {
  // This is a simplified version; typically, it integrates with react-hook-form
  return render({ field: { name, ...control.register(name) } });
};

export { Form, FormItem, FormLabel, FormControl, FormMessage, FormField };
