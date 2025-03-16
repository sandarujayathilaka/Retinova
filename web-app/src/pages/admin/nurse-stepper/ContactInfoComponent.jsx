import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Mail, Phone } from "lucide-react";

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
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const maxChars = 200;
  const addressValue = watch("address", ""); // Watch the address field

  return (
    <div className="space-y-4 text-start">
      <div className="space-y-2">
        <label htmlFor={register("phone").name} className="block text-sm font-medium text-primary">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <Input
            id={register("phone").name}
            {...register("phone")}
            className="block w-full p-2 pl-10 border rounded-md"
          />
        </div>
        {errors.phone && <span className="text-sm text-destructive">{errors.phone.message}</span>}
      </div>
      <div className="space-y-2">
        <label htmlFor={register("email").name} className="block text-sm font-medium text-primary">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <Input
            id={register("email").name}
            {...register("email")}
            className="block w-full p-2 pl-10 border rounded-md"
            readOnly={mode === "edit"}
          />
        </div>
        {errors.email && <span className="text-sm text-destructive">{errors.email.message}</span>}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <label
            htmlFor={register("address").name}
            className="block text-sm font-medium text-primary"
          >
            Address
          </label>
          <span className="text-[10px] leading-3 text-slate-400">
            {addressValue.length} / {maxChars}
          </span>
        </div>
        <Textarea
          id={register("address").name}
          {...register("address")}
          className="block w-full p-2 border rounded-md max-h-[200px]"
          maxLength={maxChars}
        />
        {errors.address && (
          <span className="text-sm text-destructive">{errors.address.message}</span>
        )}
      </div>
    </div>
  );
}
