import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { api } from "../../../services/api.service";
import { User2, Smartphone, Droplet, Ruler, Scale, AlertTriangle, Stethoscope, Phone } from "lucide-react";
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

// Step 2 schema with required emergency contact fields
const step2Schema = z.object({
  bloodType: z.string().optional(),
  height: z.number().min(0, { message: "Height cannot be negative" }).optional().or(z.literal("")),
  weight: z.number().min(0, { message: "Weight cannot be negative" }).optional().or(z.literal("")),
  allergies: z.array(z.string()).optional(),
  primaryPhysician: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(1, { message: "Name is required" }),
    relationship: z.string().min(1, { message: "Relationship is required" }),
    phone: z
      .string()
      .min(1, { message: "Number is required." })
      .regex(/^\d{10}$/, { message: "Number is invalid." }),
  }),
});

export default function AddPatientStep2({ step1Data, initialData, onPrevious, onSubmit }) {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [allergyFields, setAllergyFields] = useState(
    initialData?.allergies?.length > 0
      ? initialData.allergies.map((value, index) => ({ id: Date.now() + index, value }))
      : [{ id: Date.now(), value: "" }]
  );

  const form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      bloodType: initialData?.bloodType || "",
      height: initialData?.height || "",
      weight: initialData?.weight || "",
      allergies: initialData?.allergies || [],
      primaryPhysician: initialData?.primaryPhysician || "",
      emergencyContact: {
        name: initialData?.emergencyContact?.name || "",
        relationship: initialData?.emergencyContact?.relationship || "",
        phone: initialData?.emergencyContact?.phone || "",
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
      const updatedFields = allergyFields.filter((field) => field.id !== id);
      setAllergyFields(updatedFields);
      form.setValue("allergies", updatedFields.map((field) => field.value).filter(Boolean));
    }
  };

  const handleAllergyChange = (id, value) => {
    const updatedFields = allergyFields.map((field) =>
      field.id === id ? { ...field, value } : field
    );
    setAllergyFields(updatedFields);
    form.setValue("allergies", updatedFields.map((field) => field.value).filter(Boolean));
  };

  const handlePrevious = () => {
    const currentData = form.getValues();
    onPrevious(currentData);
  };

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const relationships = ["Father","Mother","Sister","Brother","Son", "Daughter", "Friend","Relative", "Other"];

  return (
    <div className="bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="rounded-2xl overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white py-8 px-6">
            <div className="flex items-center justify-center space-x-4">
              <User2 className="h-8 w-8" />
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                Register New Patient - Step 2
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-8 bg-white">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={() => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-teal-500" />
                          Allergies
                        </FormLabel>
                        <div className="flex flex-wrap gap-8">
                          {allergyFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                              <FormControl>
                                <Input
                                  placeholder={`Allergy ${index + 1}`}
                                  value={field.value}
                                  onChange={(e) => handleAllergyChange(field.id, e.target.value)}
                                  className="h-10 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm flex-1"
                                />
                              </FormControl>
                              {allergyFields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeAllergyField(field.id)}
                                  className="h-10 px-3 text-sm"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addAllergyField}
                          className="mt-2 h-10 px-4 text-sm border-teal-500 text-teal-500 hover:bg-teal-50 w-auto"
                        >
                          Add Another Allergy
                        </Button>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name="emergencyContact.relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                          <User2 className="h-5 w-5 text-teal-500" />
                          Relationship to Patient
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white rounded-lg shadow-lg border-gray-200">
                            {relationships.map((relationship) => (
                              <SelectItem
                                key={relationship}
                                value={relationship}
                                className="py-2 hover:bg-teal-50 rounded-lg"
                              >
                                {relationship}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
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

                <div className="flex justify-center gap-4">
                  <Button
                    type="button"
                    onClick={handlePrevious}
                    className="h-14 px-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Previous Page
                  </Button>
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