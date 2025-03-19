import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

export const contactInfoSchema = z.object({
  phone: z
    .string()
    .length(10, "Phone number must be 10 digits")
    .regex(/^0\d{9}$/, "Phone number must start with 0 and be 10 digits long"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters long")
    .max(200, "Address can't be longer than 200 characters"),
});

export default function ContactInfoComponent({ mode }) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const maxChars = 200;
  const addressValue = watch("address", ""); // Watch the address field

  return (
    <div className="space-y-5 text-start">
      {/* Phone Number Field */}
      <div className="space-y-2">
        <label
          htmlFor={register("phone").name}
          className="block text-sm font-medium text-slate-700"
        >
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <Input
            id={register("phone").name}
            {...register("phone")}
            placeholder="0XXXXXXXXX"
            className={`pl-10 ${errors.phone ? "border-red-300 focus-visible:ring-red-400" : ""}`}
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-red-600 font-medium mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Email Address Field */}
      <div className="space-y-2">
        <label
          htmlFor={register("email").name}
          className="block text-sm font-medium text-slate-700"
        >
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <Input
            id={register("email").name}
            {...register("email")}
            placeholder="nurse@example.com"
            className={`pl-10 ${errors.email ? "border-red-300 focus-visible:ring-red-400" : ""} ${
              mode === "edit" ? "bg-slate-50" : ""
            }`}
            readOnly={mode === "edit"}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600 font-medium mt-1">{errors.email.message}</p>
        )}
        {mode === "edit" && (
          <p className="text-xs text-slate-500">
            Email addresses cannot be changed after creation.
          </p>
        )}
      </div>

      {/* Address Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <label
            htmlFor={register("address").name}
            className="block text-sm font-medium text-slate-700"
          >
            Address
          </label>
          <span className="text-xs text-slate-400">
            {addressValue.length} / {maxChars}
          </span>
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-slate-500" size={16} />
          <Textarea
            id={register("address").name}
            {...register("address")}
            placeholder="Enter full office address"
            className={`pl-10 min-h-[80px] max-h-[200px] ${
              errors.address ? "border-red-300 focus-visible:ring-red-400" : ""
            }`}
            maxLength={maxChars}
          />
        </div>
        {errors.address && (
          <p className="text-xs text-red-600 font-medium mt-1">{errors.address.message}</p>
        )}
      </div>
    </div>
  );
}
