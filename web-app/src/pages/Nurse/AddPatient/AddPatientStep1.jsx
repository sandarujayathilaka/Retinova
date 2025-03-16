
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { IdCardIcon, CalendarIcon, User2, Smartphone, Home, Circle, Mail, Loader2, ChevronRight } from "lucide-react";
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
import { step1Schema, step2Schema } from "../CommonFiles/patientSchemas";

export default function AddPatientStep1({ onNext, onSubmit, initialData, step2Data, isSubmitting, formErrors, setResetForm }) {
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

  // Update form values when initialData changes (e.g., after reset)
  useEffect(() => {
    form.reset({
      fullName: initialData?.fullName || "",
      birthDate: initialData?.birthDate || "",
      nic: initialData?.nic || "",
      gender: initialData?.gender || "",
      contactNumber: initialData?.contactNumber || "",
      address: initialData?.address || "",
      email: initialData?.email || "",
    });
    if (initialData?.birthDate) {
      calculateAge(initialData.birthDate);
    } else {
      setAge(0);
    }
  }, [initialData, form]);

  useEffect(() => {
    if (step2Data) {
      const result = step2Schema.safeParse(step2Data);
      setIsStep2Valid(result.success);
    } else {
      setIsStep2Valid(false);
    }
  }, [step2Data]);

  useEffect(() => {
    // Pass the reset function to the parent component
    setResetForm(() => () => {
      form.reset({
        fullName: "",
        birthDate: "",
        nic: "",
        gender: "",
        contactNumber: "",
        address: "",
        email: "",
      });
      setAge(0); // Reset age as well
    });
  }, [form, setResetForm]);

  const isStep1Valid = form.formState.isValid;

  const handleNext = (data) => {
    onNext(data);
  };

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data); // Call the parent's onSubmit and wait for it to resolve
      // Reset will be handled by AddPatientWizard on success
    } catch (error) {
      console.log("Submission failed, form not reset:", error);
    }
  };

  return (
    <div className="bg-white min-h-screen p-10">
      <div className="mx-auto">
        <Card className="rounded-3xl overflow-hidden border-0 ">
          <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-10 px-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <User2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-extrabold tracking-tight">
                  Register New Patient
                </CardTitle>
                <p className="text-blue-200 mt-2 font-medium">Step 1: Personal Information</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 bg-white">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleNext)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <User2 className="h-4 w-4 text-blue-700" />
                          </div>
                          Full Name<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white "
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
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <IdCardIcon className="h-4 w-4 text-blue-700" />
                          </div>
                          NIC Number<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="199012345678"
                            {...field}
                            className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white "
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                        {formErrors?.nic && <p className="text-red-500 font-medium">{formErrors.nic}</p>}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <CalendarIcon className="h-4 w-4 text-blue-700" />
                          </div>
                          Date of Birth<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="date"
                              {...field}
                              className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white pr-20"
                              max={new Date().toISOString().split("T")[0]}
                              onChange={(e) => {
                                field.onChange(e);
                                calculateAge(e.target.value);
                              }}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                              Age: {age}
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
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Circle className="h-4 w-4 text-blue-700" />
                          </div>
                          Gender<span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white rounded-xl border-gray-200">
                            <SelectItem value="Male" className="py-3 hover:bg-blue-50 rounded-lg">
                              <span className="flex items-center gap-2">
                                <span className="text-blue-600">♂</span> Male
                              </span>
                            </SelectItem>
                            <SelectItem value="Female" className="py-3 hover:bg-blue-50 rounded-lg">
                              <span className="flex items-center gap-2">
                                <span className="text-pink-500">♀</span> Female
                              </span>
                            </SelectItem>
                            <SelectItem value="Other" className="py-3 hover:bg-blue-50 rounded-lg">
                              <span className="flex items-center gap-2">
                                <span className="text-purple-500">⚧</span> Other
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
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Smartphone className="h-4 w-4 text-blue-700" />
                          </div>
                          Phone Number<span className="text-red-500">*</span>
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
                            className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Mail className="h-4 w-4 text-blue-700" />
                          </div>
                          Email Address<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john.doe@example.com"
                            {...field}
                            className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                        {formErrors?.email && <p className="text-red-500 font-medium">{formErrors.email}</p>}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Home className="h-4 w-4 text-blue-700" />
                          </div>
                          Full Address<span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main Street, Colombo, Sri Lanka"
                            {...field}
                            className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-center gap-6 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 px-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="flex items-center">
                      Next Step
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </span>
                  </Button>
                  {isStep1Valid && isStep2Valid && (
                    <Button
                      type="button"
                      onClick={form.handleSubmit(handleSubmit)}
                      disabled={isSubmitting}
                      className="h-14 px-12 rounded-full bg-blue-900 hover:bg-blue-800 text-white font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <User2 className="h-5 w-5 mr-2" />
                          Register Patient
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}