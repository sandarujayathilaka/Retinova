import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";
import { Droplet, Ruler, Scale, AlertTriangle, Phone, Loader2, ChevronLeft, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";
import { step2Schema, validateEmergencyContact } from "../../CommonFiles/patientSchemas";
import PropTypes from "prop-types";
import { showErrorToast, showSuccessToast, showNoChangesToast } from "../../utils/toastUtils"; 


// Sub-component: Medical Details Section
const MedicalDetailsSection = ({ form, allergyFields, setAllergyFields, handleAllergyChange, addAllergyField, removeAllergyField }) => {
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
        <Droplet className="h-5 w-5 mr-2 text-indigo-600" />
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
                  value={field.value || ""}
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
                  value={field.value || ""}
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
              {allergyFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      placeholder={`Allergy ${index + 1}`}
                      value={field.value}
                      onChange={(e) => handleAllergyChange(field.id, e.target.value)}
                      className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex-1"
                    />
                  </FormControl>
                  {allergyFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAllergyField(field.id)}
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
                onClick={addAllergyField}
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
    </div>
  );
};

// Sub-component: Emergency Contact Section
const EmergencyContactSection = ({ form }) => {
  const relationships = ["None", "Father", "Mother", "Sister", "Brother", "Son", "Daughter", "Friend", "Relative", "Other"];

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
                <Phone className="h-4 w-4 text-blue-700" />
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
                <Phone className="h-4 w-4 text-blue-700" />
              </div>
              Relationship
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "None"}>
              <FormControl>
                <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white rounded-xl border-gray-200">
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
    </div>
  );
};

// Main Component: AddPatientStep2
export default function AddPatientStep2({ step1Data, initialData, onPrevious, onSubmit, isSubmitting, setResetForm }) {
  const [emergencyContactError, setEmergencyContactError] = useState(null);
  const [allergyFields, setAllergyFields] = useState(
    initialData?.allergies?.length > 0
      ? initialData.allergies.map((value, index) => ({ id: Date.now() + index, value }))
      : [{ id: Date.now(), value: "" }]
  );

  // Initialize form with default values and schema validation
  const form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      bloodType: initialData?.bloodType || "",
      height: initialData?.height || "",
      weight: initialData?.weight || "",
      allergies: initialData?.allergies || [],
      emergencyContact: {
        name: initialData?.emergencyContact?.name || "",
        relationship: initialData?.emergencyContact?.relationship || "None",
        phone: initialData?.emergencyContact?.phone || "",
      },
    },
  });

  // Set up form reset function for parent component
  useEffect(() => {
    setResetForm(() => () => {
      form.reset({
        bloodType: "",
        height: "",
        weight: "",
        allergies: [],
        emergencyContact: {
          name: "",
          relationship: "None",
          phone: "",
        },
      });
      setAllergyFields([{ id: Date.now(), value: "" }]);
    });
  }, [form, setResetForm]);

  // Handle allergy field addition
  const addAllergyField = useCallback(() => {
    setAllergyFields((prev) => [...prev, { id: Date.now(), value: "" }]);
  }, []);

  // Handle allergy field removal
  const removeAllergyField = useCallback((id) => {
    if (allergyFields.length > 1) {
      const updatedFields = allergyFields.filter((field) => field.id !== id);
      setAllergyFields(updatedFields);
      form.setValue("allergies", updatedFields.map((field) => field.value).filter(Boolean));
    }
  }, [allergyFields, form]);

  // Handle allergy field value change
  const handleAllergyChange = useCallback((id, value) => {
    const updatedFields = allergyFields.map((field) =>
      field.id === id ? { ...field, value } : field
    );
    setAllergyFields(updatedFields);
    form.setValue("allergies", updatedFields.map((field) => field.value).filter(Boolean));
  }, [allergyFields, form]);

  // Handle previous button click
  const handlePrevious = useCallback(() => {
    const currentData = form.getValues();
    onPrevious(currentData);
  }, [form, onPrevious]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (data) => {
      try {
        setEmergencyContactError(null);

        // Validate emergency contact fields
        const result = validateEmergencyContact(data.emergencyContact);
        if (!result.valid) {
          if (result.errors && Object.keys(result.errors).length > 0) {
            Object.entries(result.errors).forEach(([field, message]) => {
              form.setError(`emergencyContact.${field}`, { type: "manual", message });
            });
            setEmergencyContactError("Please fill in all emergency contact fields or leave them all empty.");
          } else {
            showErrorToast("Unexpected validation error occurred.");
       
          }
          return;
        }

        // If relationship is "None", clear emergency contact data
        if (data.emergencyContact.relationship === "None") {
          data.emergencyContact = {};
        }

        // Combine step 1 and step 2 data
        const combinedData = { ...(step1Data || {}), ...data };
        await onSubmit(combinedData);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to register patient. Please try again.";
        showErrorToast(errorMessage);  
        throw error;
      }
    },
    [form, step1Data, onSubmit]
  );

  return (
    <div className="bg-white min-h-screen p-10">
      <div className="mx-auto">
        <Card className="rounded-3xl overflow-hidden border-0">
          <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-10 px-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                <Droplet className="h-8 w-8 text-white" />
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
                    allergyFields={allergyFields}
                    setAllergyFields={setAllergyFields}
                    handleAllergyChange={handleAllergyChange}
                    addAllergyField={addAllergyField}
                    removeAllergyField={removeAllergyField}
                  />
                  <EmergencyContactSection form={form} />
                </div>

                {emergencyContactError && (
                  <div className="text-red-500 text-center font-medium">{emergencyContactError}</div>
                )}

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
                        <Droplet className="h-5 w-5 mr-2" />
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

// PropTypes for type safety and documentation
AddPatientStep2.propTypes = {
  step1Data: PropTypes.object,
  initialData: PropTypes.object,
  onPrevious: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  setResetForm: PropTypes.func.isRequired,
};
