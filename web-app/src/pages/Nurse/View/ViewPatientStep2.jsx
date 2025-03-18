import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useCallback } from "react";
import { Droplet, Ruler, Scale, AlertTriangle, Phone, Loader2, Save, ChevronLeft, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { step2Schema, validateEmergencyContact } from "../../CommonFiles/patientSchemas";
import PropTypes from "prop-types";
import { showErrorToast, showSuccessToast, showNoChangesToast } from "../../utils/toastUtils";

const ViewPatientStep2 = ({ initialData, onPrevious, onSave, onCancel, isSubmitting, normalizeData }) => {
  const [emergencyContactError, setEmergencyContactError] = useState(null);
  const [allergyFields, setAllergyFields] = useState(
    initialData?.allergies?.length > 0
      ? initialData.allergies.map((value, index) => ({ id: Date.now() + index, value }))
      : [{ id: Date.now(), value: "" }]
  );

  const form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: initialData || {
      bloodType: "",
      height: "",
      weight: "",
      allergies: [""],
      emergencyContact: { name: "", relationship: "None", phone: "" },
    },
  });

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

  const handlePrevious = () => {
    const currentData = form.getValues();
    onPrevious(currentData);
  };


  const validateEmergencyContact = (contact) => {
    if (!contact) return { valid: true };
    
    // Handle null values in the contact object
    const name = contact.name || "";
    const relationship = contact.relationship || "";
    const phone = contact.phone || "";
    
    // If relationship is "None", we should treat it as empty
    if (relationship === "None") {
      // If any other field is filled, we need all fields filled
      if (name || phone) {
        return { 
          valid: false, 
          message: "Please fill in all emergency contact fields or leave them all empty."
        };
      }
      return { valid: true }; // All fields empty, valid state
    }
    
    // If any field is filled, all must be filled
    if (name || relationship || phone) {
      if (!(name && relationship && phone)) {
        return {
          valid: false,
          message: "Please fill in all emergency contact fields or leave them all empty."
        };
      }
      
      // Check phone format
      if (!/^\d{10}$/.test(phone)) {
        return {
          valid: false,
          message: "Emergency contact phone must be a valid 10-digit number."
        };
      }
    }
    
    return { valid: true }; // Validation passed
  };

  const handleSubmit = async (data) => {
    try {
      setEmergencyContactError(null);
      
      // Handle null/undefined values in the form data
      if (!data.emergencyContact) {
        data.emergencyContact = { name: "", relationship: "None", phone: "" };
      }
      
      // Validate emergency contact
      const emergencyValidation = validateEmergencyContact(data.emergencyContact);
      if (!emergencyValidation.valid) {
        setEmergencyContactError(emergencyValidation.message);
        
        // If validation fails, highlight fields by setting form errors
        if (data.emergencyContact) {
          if (!data.emergencyContact.name) {
            form.setError("emergencyContact.name", {
              type: "manual",
              message: "Required if other fields are filled"
            });
          }
          if (!data.emergencyContact.relationship || data.emergencyContact.relationship === "None") {
            form.setError("emergencyContact.relationship", {
              type: "manual",
              message: "Required if other fields are filled"
            });
          }
          if (!data.emergencyContact.phone) {
            form.setError("emergencyContact.phone", {
              type: "manual",
              message: "Required if other fields are filled"
            });
          }
        }
        
        return;
      }
      
      // Process allergies - filter out empty values
      const cleanedAllergies = data.allergies ? data.allergies.filter(Boolean) : [];
      
      // Normalize emergency contact data
      let emergencyContact = null;
      if (data.emergencyContact && 
          data.emergencyContact.relationship && 
          data.emergencyContact.relationship !== "None" && 
          data.emergencyContact.name && 
          data.emergencyContact.phone) {
        emergencyContact = {
          name: data.emergencyContact.name,
          relationship: data.emergencyContact.relationship,
          phone: data.emergencyContact.phone
        };
      }
      
      // Prepare normalized data for saving
      const formattedData = {
        ...data,
        allergies: cleanedAllergies,
        emergencyContact: emergencyContact
      };
      
      await onSave(formattedData);
    } catch (error) {
      console.error("Error in ViewPatientStep2 handleSubmit:", error);
      setEmergencyContactError(error.message || "An error occurred");
    }}
    
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const relationships = ["None", "Father", "Mother", "Sister", "Brother", "Son", "Daughter", "Friend", "Relative", "Other"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
              <Droplet className="h-5 w-5 mr-2 text-indigo-600" />
              Medical Information
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
                  <Select onValueChange={field.onChange} value={field.value || ""}>
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
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        aria-label="Height"
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
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        aria-label="Weight"
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
                            aria-label={`Allergy ${index + 1}`}
                          />
                        </FormControl>
                        {allergyFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAllergyField(field.id)}
                            className="h-10 w-10 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                            aria-label={`Remove allergy ${index + 1}`}
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
                      aria-label="Add another allergy"
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
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-indigo-600" />
              Emergency Contact
            </h3>
            {emergencyContactError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-500 font-medium text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {emergencyContactError}
                </p>
              </div>
            )}
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
                      {...field}
                      className={`h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        emergencyContactError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                      aria-label="Emergency Contact Name"
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
                      <SelectTrigger
                        className={`h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                          emergencyContactError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                        }`}
                      >
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
                      {...field}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "");
                        field.onChange(numericValue);
                      }}
                      className={`h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        emergencyContactError || form.formState.errors.emergencyContact?.phone
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      aria-label="Emergency Contact Phone Number"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 font-medium" />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-center gap-6 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-12 px-6 rounded-full bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all duration-300"
            aria-label="Cancel editing"
          >
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button
            type="button"
            onClick={handlePrevious}
            disabled={isSubmitting}
            className="h-12 px-6 rounded-full bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all duration-300"
            aria-label="Go to previous step"
          >
            <span className="flex items-center">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Step
            </span>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300"
            aria-label="Save changes"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

ViewPatientStep2.propTypes = {
  initialData: PropTypes.object,
  onPrevious: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  normalizeData: PropTypes.func.isRequired,
};

export default ViewPatientStep2;