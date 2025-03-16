import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api.service";
import { User2, Droplet, Ruler, Scale, AlertTriangle, Stethoscope, Phone, Loader2, ChevronLeft, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";
import { step2Schema, validateEmergencyContact } from "../CommonFiles/patientSchemas";
import PropTypes from "prop-types";

// Sub-component: Medical Details Section (unchanged)
const MedicalDetailsSection = ({ form, doctors, filteredDoctors, searchTerm, setSearchTerm, handleDoctorSearch }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "allergies",
  });

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="space-y-6">
      {/* ... Medical Details Section remains unchanged ... */}
      <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
        <Stethoscope className="h-5 w-5 mr-2 text-indigo-600" />
        Medical Details
      </h3>

      <FormField
        control={form.control}
        name="bloodType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Droplet className="h-4 w-4 text-blue-700" />
              </div>
              Blood Type
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white rounded-xl border-gray-200">
                {bloodTypes.map((type) => (
                  <SelectItem key={type} value={type} className="py-3 hover:bg-blue-50 rounded-lg">
                    <span className={`font-semibold ${type.includes("+") ? "text-red-600" : "text-indigo-600"}`}>{type}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-red-500 font-medium" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Ruler className="h-4 w-4 text-blue-700" />
                </div>
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
                  className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
              <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Scale className="h-4 w-4 text-blue-700" />
                </div>
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
                  className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </FormControl>
              <FormMessage className="text-red-500 font-medium" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="allergies"
        render={() => (
          <FormItem>
            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <AlertTriangle className="h-4 w-4 text-blue-700" />
              </div>
              Allergies
            </FormLabel>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      placeholder={`Allergy ${index + 1}`}
                      {...form.register(`allergies.${index}`)}
                      className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex-1"
                    />
                  </FormControl>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-10 w-10 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append("")}
                className="mt-3 h-10 px-4 text-sm border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Allergy
              </Button>
            </div>
            <FormMessage className="text-red-500 font-medium" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="primaryPhysician"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Stethoscope className="h-4 w-4 text-blue-700" />
              </div>
              Primary Physician
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <SelectValue placeholder="Select physician" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white rounded-xl border-gray-200 max-h-60 overflow-y-auto">
                <div className="p-2">
                  <Input
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={handleDoctorSearch}
                    className="h-10 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Search doctors"
                  />
                </div>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <SelectItem key={doctor._id} value={doctor._id} className="py-2 hover:bg-blue-50 rounded-lg">
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
    </div>
  );
};

// Sub-component: Emergency Contact Section
const EmergencyContactSection = ({ form }) => {
  const relationships = ["Father", "Mother", "Sister", "Brother", "Son", "Daughter", "Friend", "Relative", "Other"];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
        <Phone className="h-5 w-5 mr-2 text-indigo-600" />
        Emergency Contact
      </h3>

      <FormField
        control={form.control}
        name="emergencyContact.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <User2 className="h-4 w-4 text-blue-700" />
              </div>
              Contact Name
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Jane Doe"
                {...field}
                className={`h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                  form.formState.errors.emergencyContact?.name ? "border-red-300" : ""
                }`}
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
            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <User2 className="h-4 w-4 text-blue-700" />
              </div>
              Relationship
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white rounded-xl border-gray-200">
                <SelectItem value="none" className="py-3 hover:bg-blue-50 rounded-lg">
                  None
                </SelectItem>
                {relationships.map((relationship) => (
                  <SelectItem key={relationship} value={relationship} className="py-3 hover:bg-blue-50 rounded-lg">
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
            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Phone className="h-4 w-4 text-blue-700" />
              </div>
              Phone Number
            </FormLabel>
            <FormControl>
              <Input
                placeholder="0771234567"
                {...field}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, "");
                  field.onChange(numericValue);
                }}
                className={`h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                  form.formState.errors.emergencyContact?.phone ? "border-red-300" : ""
                }`}
              />
            </FormControl>
            <FormMessage className="text-red-500 font-medium" />
          </FormItem>
        )}
      />

      <div className="bg-blue-50 rounded-xl p-6 mt-6 border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="bg-blue-600 rounded-full p-2 mt-1">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="text-blue-900 font-semibold mb-1">Important</h4>
            <p className="text-sm text-blue-700">
              Providing emergency contact information is optional but recommended. This person will be contacted in case of medical emergencies if provided.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component: AddPatientStep2
export default function AddPatientStep2({ step1Data, initialData, onPrevious, onSubmit, isSubmitting, formErrors, setResetForm }) {
  const [emergencyContactError, setEmergencyContactError] = useState(null);

  const form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      bloodType: initialData?.bloodType || "",
      height: initialData?.height || "",
      weight: initialData?.weight || "",
      allergies: initialData?.allergies?.length > 0 ? initialData.allergies : [""],
      primaryPhysician: initialData?.primaryPhysician || "",
      emergencyContact: {
        name: initialData?.emergencyContact?.name || "",
        relationship: initialData?.emergencyContact?.relationship || "",
        phone: initialData?.emergencyContact?.phone || "",
      },
    },
  });

  // Fetch doctors using React Query
  const { data: doctors = [], isLoading, error } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const response = await api.get("/doctors/names");
      return response.data.doctors;
    },
    onError: () => toast.error("Failed to fetch doctors list."),
    staleTime: 5 * 60 * 1000, // 5 minutes: Data is considered fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes: Data stays in cache for 10 minutes after becoming unused
  });

  const [filteredDoctors, setFilteredDoctors] = useState(doctors);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setFilteredDoctors(doctors);
  }, [doctors]);

  useEffect(() => {
    setResetForm(() => () => {
      form.reset({
        bloodType: "",
        height: "",
        weight: "",
        allergies: [""],
        primaryPhysician: "",
        emergencyContact: {
          name: "",
          relationship: "",
          phone: "",
        },
      });
    });
  }, [form, setResetForm]);

  const handleDoctorSearch = useCallback(
    debounce((term) => {
      const filtered = doctors.filter((doctor) => doctor.name.toLowerCase().includes(term.toLowerCase()));
      setFilteredDoctors(filtered);
    }, 300),
    [doctors]
  );

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    handleDoctorSearch(term);
  };

  const handlePrevious = () => {
    const currentData = form.getValues();
    onPrevious(currentData);
  };

  const handleSubmit = async (data) => {
    console.log("handleSubmit called with data:", data);
    try {
      console.log("relationship:", data.emergencyContact.relationship);
      setEmergencyContactError(null);
      const result = validateEmergencyContact(data.emergencyContact);
      console.log("validation result:", result);
  
      if (!result.valid) {
        if (result.errors && Object.keys(result.errors).length > 0) {
          Object.entries(result.errors).forEach(([field, message]) => {
            form.setError(`emergencyContact.${field}`, { type: "manual", message });
          });
          setEmergencyContactError("Please fill in all emergency contact fields or leave them all empty.");
        } else {
          toast.error("Unexpected validation error occurred.");
        }
        return;
      }
  
      // Convert "none" to empty string before submission
      if (data.emergencyContact.relationship === "none") {
        data.emergencyContact.relationship = "";
      }
  
      const combinedData = { ...(step1Data || {}), ...data };
      console.log("Submitting combined data:", combinedData);
      await onSubmit(combinedData);
      console.log("onSubmit completed");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to register patient. Please try again.";
      console.error("Error in handleSubmit:", error);
      toast.error(errorMessage);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">Error loading doctors. Please try again later.</div>;
  }

  return (
    <div className="bg-white min-h-screen p-10">
      <div className="mx-auto">
        <Card className="rounded-3xl overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-10 px-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <User2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-extrabold tracking-tight">Register New Patient</CardTitle>
                <p className="text-blue-200 mt-2 font-medium">Step 2: Medical Information</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 bg-white">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <MedicalDetailsSection
                    form={form}
                    doctors={doctors}
                    filteredDoctors={filteredDoctors}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleDoctorSearch={handleSearchChange}
                  />
                  <EmergencyContactSection form={form} />
                </div>

                <Separator className="my-6 bg-blue-100" />

                <div className="flex justify-center gap-6 pt-4">
                  <Button
                    type="button"
                    onClick={handlePrevious}
                    disabled={isSubmitting}
                    className="h-14 px-12 rounded-full bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all duration-300 transform hover:scale-105"
                    aria-label="Go to previous step"
                  >
                    <span className="flex items-center">
                      <ChevronLeft className="h-5 w-5 mr-2" />
                      Previous Step
                    </span>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-14 px-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300 transform hover:scale-105"
                    aria-label="Register patient"
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
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// PropTypes for type safety
AddPatientStep2.propTypes = {
  step1Data: PropTypes.object,
  initialData: PropTypes.object,
  onPrevious: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  formErrors: PropTypes.object,
  setResetForm: PropTypes.func.isRequired,
};