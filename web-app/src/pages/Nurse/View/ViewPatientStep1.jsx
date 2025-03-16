import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { IdCardIcon, CalendarIcon, User2, Smartphone, Mail, Home, Circle, Loader2 } from "lucide-react";
import { step2Schema } from "../CommonFiles/patientSchemas"; // Import step2Schema for validation

const step1Schema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  nic: z.string().min(10, { message: "NIC must be at least 10 characters." }),
  birthDate: z.string().min(1, { message: "Date of birth is required." }),
  gender: z.enum(["Male", "Female", "Other"], { message: "Gender is required." }),
  contactNumber: z
    .string()
    .min(1, { message: "Phone number is required." })
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email address." }),
});

const ViewPatientStep1 = ({ initialData, step2Data, onNext, onSave, onCancel, isSubmitting }) => {
  const form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      nic: initialData?.nic || "",
      birthDate: initialData?.birthDate || "",
      gender: initialData?.gender || "",
      contactNumber: initialData?.contactNumber || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
    },
  });

  // Check if Step 2 data is valid to enable the Save button
  const isStep2Valid = step2Data ? step2Schema.safeParse(step2Data).success : false;
  const isStep1Valid = form.formState.isValid;

  const handleNext = (data) => {
    onNext(data);
  };

  const handleSave = async (data) => {
    await onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleNext)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <User2 className="h-5 w-5 text-teal-500" />
                  Full Name<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} className="rounded-lg border-gray-300 focus:ring-teal-400" />
                </FormControl>
                <FormMessage className="text-red-500 font-medium" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <IdCardIcon className="h-5 w-5 text-teal-500" />
                  NIC Number<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} className="rounded-lg border-gray-300 focus:ring-teal-400" />
                </FormControl>
                <FormMessage className="text-red-500 font-medium" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-teal-500" />
                  Date of Birth<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="rounded-lg border-gray-300 focus:ring-teal-400"
                  />
                </FormControl>
                <FormMessage className="text-red-500 font-medium" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <Circle className="h-5 w-5 text-teal-500" />
                  Gender<span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-lg border-gray-300 focus:ring-teal-400">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white rounded-lg shadow-lg">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500 font-medium" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-teal-500" />
                  Phone Number<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      field.onChange(numericValue);
                    }}
                    className="rounded-lg border-gray-300 focus:ring-teal-400"
                  />
                </FormControl>
                <FormMessage className="text-red-500 font-medium" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-teal-500" />
                  Email Address<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} className="rounded-lg border-gray-300 focus:ring-teal-400" />
                </FormControl>
                <FormMessage className="text-red-500 font-medium" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <Home className="h-5 w-5 text-teal-500" />
                  Full Address<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} className="rounded-lg border-gray-300 focus:ring-teal-400" />
                </FormControl>
                <FormMessage className="text-red-500 font-medium" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-center gap-4">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-gray-500 hover:bg-gray-600 rounded-full px-6 py-2 text-white shadow-md transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-500 hover:bg-teal-600 rounded-full px-6 py-2 text-white shadow-md transition-all duration-200"
          >Next Step
           
          </Button>
          {isStep1Valid && isStep2Valid && (
            <Button
              type="button"
              onClick={form.handleSubmit(handleSave)}
              disabled={isSubmitting}
              className="bg-teal-500 hover:bg-teal-600 rounded-full px-6 py-2 text-white shadow-md transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default ViewPatientStep1;