import React from "react";
import { cn } from "../../lib/utils";

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-gray-200", className)}
    {...props}
  >
    <div className="h-full bg-blue-600 transition-all" style={{ width: `${value}%` }} />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
