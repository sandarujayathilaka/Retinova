import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { api } from "../services/api.service";
import { IdCardIcon,CalendarIcon, User2, Smartphone, Mail, Home, Circle } from "lucide-react";

// UI Components
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
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  birthDate: z.string(),
  nic: z.string().min(10, { message: "NIC must be at least 10 characters." }),
  gender: z.enum(["Male", "Female", "Other"]),
  contactNumber: z.string().min(10, { message: "Phone number is invalid." }),
  email: z.string().email({ message: "Invalid email address." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
});

export default function AddPatient() {
  const [age, setAge] = useState(0);
 
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      birthDate: "",
      nic: "",
      gender: "Male",
      contactNumber: "",
      email: "",
      address: "",
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

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/patients/add", data);
      if(response){
 toast.success("Patient registered successfully", {
  position: "top-right",
        autoClose: 3000,
      })
      form.reset();
      setAge(0);
      }
     
    } catch (error) {
      if (error.response) {
        const { errorCode, message } = error.response.data;
        if (errorCode === "MISSING_FIELDS") {
          toast.error("Please fill in all required fields.", {
            position: "top-right",
            autoClose: 3000, 
          })
        } else if (errorCode === "DUPLICATE_NIC") {
          toast.error("A patient with this NIC already exists.", {
            position: "top-right",
            autoClose: 3000, 
          })
        }else if (errorCode === "DUPLICATE_EMAIL") {
          toast.error("A patient with this email already exists.", {
            position: "top-right",
            autoClose: 3000, 
          })
        } else {
          toast.error(`Error: ${message}`, {
            position: "top-right",
            autoClose: 3000, 
          })
         
        }
      } else if (error.request) {
        toast.error("No response from the server. Please try again later.", {
          position: "top-right",
          autoClose: 3000, 
        })
      } else {
        toast.error("An unexpected error occurred.", {
          position: "top-right",
          autoClose: 3000, 
        })
      }
    }
  };    

  return (
    <div className=" bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="rounded-2xl overflow-hidden border-0 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white py-8 px-6">
            <div className="flex items-center justify-center space-x-4">
              <User2 className="h-8 w-8" />
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                Register New Patient
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-8 bg-white">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
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
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                  {/* NIC Field */}
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
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />

                  {/* Birth Date Field */}
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
                              className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm pr-20 transition-all duration-200"
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

                  {/* Gender Field */}
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
                            <SelectItem
                              value="Male"
                              className="py-2 hover:bg-teal-50 rounded-lg transition-all duration-200"
                            >
                              <span className="flex items-center gap-2">
                                <span>♂</span> Male
                              </span>
                            </SelectItem>
                            <SelectItem
                              value="Female"
                              className="py-2 hover:bg-teal-50 rounded-lg transition-all duration-200"
                            >
                              <span className="flex items-center gap-2">
                                <span>♀</span> Female
                              </span>
                            </SelectItem>
                            <SelectItem
                              value="Other"
                              className="py-2 hover:bg-teal-50 rounded-lg transition-all duration-200"
                            >
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

                  {/* Phone Field */}
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
                            placeholder="077 123 4567"
                            {...field}
                            value={field.value}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, ''); // Removes non-numeric characters
                              field.onChange(numericValue);
                            }}
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />


                  {/* Email Field */}
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
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />

                  {/* Address Field */}
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
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm transition-all duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-6 bg-gray-200" />

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="h-14 px-12 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <User2 className="h-5 w-5 mr-2" />
                    Register Patient
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