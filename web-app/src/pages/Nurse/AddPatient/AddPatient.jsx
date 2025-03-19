import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { api } from "../../../services/api.service";
import { IdCardIcon, CalendarIcon, User2, Smartphone, Mail, Home, Circle, Droplet, Ruler, Scale, AlertTriangle, Stethoscope, Phone } from "lucide-react";

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
import { toast } from "react-hot-toast";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  birthDate: z.string(),
  nic: z.string().min(10, { message: "NIC must be at least 10 characters." }),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  contactNumber: z.string().min(10, { message: "Phone number is invalid." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  bloodType: z.string().optional(),
  height: z.number().min(0, { message: "Height cannot be negative" }).optional().or(z.literal("")),
  weight: z.number().min(0, { message: "Weight cannot be negative" }).optional().or(z.literal("")),
  allergies: z.array(z.string()).optional(),
  primaryPhysician: z.string().optional(),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  emergencyContact: z.object({
    name: z.string().min(1, { message: "Name is required" }).optional(),
    relationship: z.string().min(1, { message: "Relation is required" }).optional(),
    phone: z.string().min(10, { message: "Phone number is invalid" }).optional(),
  }).optional(),
});

export default function AddPatient() {
  const [age, setAge] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allergyFields, setAllergyFields] = useState([{ id: Date.now(), value: "" }]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      birthDate: "",
      nic: "",
      gender: "",
      contactNumber: "",
      email: "",
      bloodType: "",
      height: "",
      weight: "",
      allergies: [],
      primaryPhysician: "",
      address: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
    },
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/doctors/names");
        setDoctors(response.data.doctors);
        setFilteredDoctors(response.data.doctors);
      } catch (error) {
        toast.error("Failed to fetch doctors list.");
      }
    };
    fetchDoctors();
  }, []);

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

  const handleDoctorSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = doctors.filter((doctor) =>
      doctor.name.toLowerCase().includes(term)
    );
    setFilteredDoctors(filtered);
  };

  const addAllergyField = () => {
    setAllergyFields([...allergyFields, { id: Date.now(), value: "" }]);
  };

  const removeAllergyField = (id) => {
    if (allergyFields.length > 1) {
      setAllergyFields(allergyFields.filter((field) => field.id !== id));
    }
  };

  const handleAllergyChange = (id, value) => {
    const updatedFields = allergyFields.map((field) =>
      field.id === id ? { ...field, value } : field
    );
    setAllergyFields(updatedFields);
    form.setValue("allergies", updatedFields.map((field) => field.value).filter(Boolean));
  };

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        height: data.height ? Number(data.height) : undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        allergies: data.allergies.length > 0 ? data.allergies : undefined,
        emergencyContact: data.emergencyContact.name ? data.emergencyContact : undefined,
      };
      const response = await api.post("/patients/add", formattedData);
      if (response) {
        // toast.success("Patient registered successfully", {
        //   position: "top-right",
        //   autoClose: 3000,
        // });
        form.reset();
        setAge(0);
        setSearchTerm("");
        setFilteredDoctors(doctors);
        setAllergyFields([{ id: Date.now(), value: "" }]);
      }
    } catch (error) {
      // if (error.response) {
      //   const { errorCode, message } = error.response.data;
      //   if (errorCode === "MISSING_FIELDS") {
      //     toast.error("Please fill in all required fields.");
      //   } else if (errorCode === "DUPLICATE_NIC") {
      //     toast.error("A patient with this NIC already exists.");
      //   } else if (errorCode === "DUPLICATE_EMAIL") {
      //     toast.error("A patient with this email already exists.");
      //   } else {
      //     toast.error(`Error: ${message}`);
      //   }
      // } else if (error.request) {
      //   toast.error("No response from the server. Please try again later.");
      // } else {
      //   toast.error("An unexpected error occurred.");
      // }
    }
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="bg-gray-100 p-6">
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
                  {/* Full Name */}
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
                  {/* NIC */}
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
                  {/* Birth Date */}
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
                  {/* Gender */}
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
                  {/* Contact Number */}
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
                  {/* Email */}
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
                  {/* Blood Type */}
                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <Droplet className="h-5 w-5 text-teal-500" />
                          Blood Type
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm">
                              <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white rounded-lg shadow-lg border-gray-200">
                            {bloodTypes.map((type) => (
                              <SelectItem
                                key={type}
                                value={type}
                                className="py-2 hover:bg-teal-50 rounded-lg"
                              >
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                  {/* Height */}
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <Ruler className="h-5 w-5 text-teal-500" />
                          Height (cm)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="170"
                            min={0}
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                  {/* Weight */}
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <Scale className="h-5 w-5 text-teal-500" />
                          Weight (kg)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="70"
                            min={0}
                            {...field}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                  {/* Allergies */}
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={() => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-teal-500" />
                          Allergies
                        </FormLabel>
                        <div className="space-y-4">
                          {allergyFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                              <FormControl>
                                <Input
                                  placeholder={`Allergy ${index + 1}`}
                                  value={field.value}
                                  onChange={(e) => handleAllergyChange(field.id, e.target.value)}
                                  className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
                                />
                              </FormControl>
                              {allergyFields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeAllergyField(field.id)}
                                  className="h-12 px-4"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addAllergyField}
                            className="h-12 w-full mt-2 border-teal-500 text-teal-500 hover:bg-teal-50"
                          >
                            Add Another Allergy
                          </Button>
                        </div>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                  {/* Primary Physician */}
                  <FormField
                    control={form.control}
                    name="primaryPhysician"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <Stethoscope className="h-5 w-5 text-teal-500" />
                          Primary Physician
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm">
                              <SelectValue placeholder="Select physician" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white rounded-lg shadow-lg border-gray-200 max-h-60 overflow-y-auto">
                            <div className="p-2">
                              <Input
                                placeholder="Search doctors..."
                                value={searchTerm}
                                onChange={handleDoctorSearch}
                                className="h-10 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            {filteredDoctors.length > 0 ? (
                              filteredDoctors.map((doctor) => (
                                <SelectItem
                                  key={doctor._id}
                                  value={doctor._id}
                                  className="py-2 hover:bg-teal-50 rounded-lg"
                                >
                                  {doctor.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-gray-500">No doctors found</div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                  {/* Address */}
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
                  {/* Emergency Contact - Name */}
                  <FormField
                    control={form.control}
                    name="emergencyContact.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <User2 className="h-5 w-5 text-teal-500" />
                          Emergency Contact Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jane Doe"
                            {...field}
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                  {/* Emergency Contact - Relationship */}
                  <FormField
                    control={form.control}
                    name="emergencyContact.relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <User2 className="h-5 w-5 text-teal-500" />
                          Relation to Patient
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Spouse"
                            {...field}
                            className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                  {/* Emergency Contact - Phone */}
                  <FormField
                    control={form.control}
                    name="emergencyContact.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <Phone className="h-5 w-5 text-teal-500" />
                          Emergency Contact Phone
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0771234567"
                            {...field}
                            value={field.value || ""}
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





