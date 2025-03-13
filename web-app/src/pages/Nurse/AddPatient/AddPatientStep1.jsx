import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { IdCardIcon, CalendarIcon, User2, Smartphone, Home, Circle, Mail } from "lucide-react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Step 1 schema
const step1Schema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  birthDate: z.string().min(1, { message: "Date of birth is required." }),
  nic: z.string().min(10, { message: "NIC must be at least 10 characters." }),
  gender: z.enum(["Male", "Female", "Other"], { message: "Gender is required." }),
  contactNumber: z
    .string()
    .min(1, { message: "Number is required." })
    .regex(/^\d{10}$/, { message: "Number is invalid." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  email: z
    .string()
    .min(1, { message: "Email is required." }) // First check for empty string
    .email({ message: "Invalid email address." }), // Then validate email format
});

// Step 2 schema for validation (required fields only)
const step2SchemaRequired = z.object({
  emergencyContact: z.object({
    name: z.string().min(1, { message: "Name is required" }),
    relationship: z.string().min(1, { message: "Relationship is required" }),
    phone: z
      .string()
      .min(1, { message: "Number is required." })
      .regex(/^\d{10}$/, { message: "Number is invalid." }),
  }),
});

export default function AddPatientStep1({ onNext, onSubmit, initialData, step2Data }) {
  const [age, setAge] = useState(0);
  const [isStep2Valid, setIsStep2Valid] = useState(false);

  const form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      birthDate: initialData?.birthDate || "",
      nic: initialData?.nic || "",
      gender: initialData?.gender || "",
      contactNumber: initialData?.contactNumber || "",
      address: initialData?.address || "",
      email: initialData?.email || "",
    },
  });

  const calculateAge = (birthDate) => {
    if (!birthDate) {
      setAge(0);
      return;
    }
    const today = new Date();
    const dob = new Date(birthDate);
    let calculatedAge = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge);
  };

  useEffect(() => {
    if (initialData?.birthDate) {
      calculateAge(initialData.birthDate);
    }
  }, [initialData]);

  useEffect(() => {
    // Validate Step 2 data whenever it changes
    if (step2Data) {
      const result = step2SchemaRequired.safeParse(step2Data);
      setIsStep2Valid(result.success);
    } else {
      setIsStep2Valid(false);
    }
  }, [step2Data]);

  const isStep1Valid = form.formState.isValid;

  const handleNext = (data) => {
    onNext(data);
  };

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div className="bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="rounded-2xl overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white py-8 px-6">
            <div className="flex items-center justify-center space-x-4">
              <User2 className="h-8 w-8" />
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                Register New Patient - Step 1
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-8 bg-white">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleNext)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <User2 className="h-5 w-5 text-teal-500" />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
                          />
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
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <IdCardIcon className="h-5 w-5 text-teal-500" />
                          NIC Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="199012345678"
                            {...field}
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
                          />
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
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-teal-500" />
                          Date of Birth
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="date"
                              {...field}
                              className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm pr-20"
                              max={new Date().toISOString().split("T")[0]}
                              onChange={(e) => {
                                field.onChange(e);
                                calculateAge(e.target.value);
                              }}
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-sm font-medium">
                              {age || 0}
                            </div>
                          </div>
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
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <Circle className="h-5 w-5 text-teal-500" />
                          Gender
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white rounded-lg shadow-lg border-gray-200">
                            <SelectItem value="Male" className="py-2 hover:bg-teal-50 rounded-lg">
                              <span className="flex items-center gap-2">
                                <span>♂</span> Male
                              </span>
                            </SelectItem>
                            <SelectItem value="Female" className="py-2 hover:bg-teal-50 rounded-lg">
                              <span className="flex items-center gap-2">
                                <span>♀</span> Female
                              </span>
                            </SelectItem>
                            <SelectItem value="Other" className="py-2 hover:bg-teal-50 rounded-lg">
                              <span className="flex items-center gap-2">
                                <span>⚧</span> Other
                              </span>
                            </SelectItem>
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
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-teal-500" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0771234567"
                            {...field}
                            value={field.value}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, '');
                              field.onChange(numericValue);
                            }}
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
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
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <Mail className="h-5 w-5 text-teal-500" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john.doe@example.com"
                            {...field}
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
                          />
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
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <Home className="h-5 w-5 text-teal-500" />
                          Full Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main Street, Colombo, Sri Lanka"
                            {...field}
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-center gap-4">
                  {isStep1Valid && isStep2Valid && (
                    <Button
                      type="button"
                      onClick={form.handleSubmit(handleSubmit)}
                      className="h-14 px-12 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <User2 className="h-5 w-5 mr-2" />
                      Register Patient
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="h-14 px-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Next Step
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}