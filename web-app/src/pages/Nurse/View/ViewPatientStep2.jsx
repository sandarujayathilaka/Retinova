import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { api } from "../../../services/api.service";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Droplet, Ruler, Scale, AlertTriangle, Stethoscope, Phone, User2, Loader2, Save, ChevronLeft, X, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { step2Schema, validateEmergencyContact } from "../CommonFiles/patientSchemas";
import PropTypes from "prop-types";

const ViewPatientStep2 = ({ initialData, onPrevious, onSave, onCancel, isSubmitting }) => {
  const [emergencyContactError, setEmergencyContactError] = useState(null);
  const form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: initialData || {
      bloodType: "",
      height: "",
      weight: "",
      allergies: [""],
      primaryPhysician: "",
      emergencyContact: { name: "", relationship: "", phone: "" },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "allergies",
  });

  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const response = await api.get("/doctors/names");
      return response.data.doctors;
    },
    onError: () => toast.error("Failed to fetch doctors list."),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [filteredDoctors, setFilteredDoctors] = useState(doctors);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setFilteredDoctors(doctors);
  }, [doctors]);

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
    try {
      setEmergencyContactError(null);
      const result = validateEmergencyContact(data.emergencyContact);

      if (!result.valid) {
        if (result.errors && Object.keys(result.errors).length > 0) {
          Object.entries(result.errors).forEach(([field, message]) => {
            form.setError(`emergencyContact.${field}`, { type: "manual", message });
          });
          setEmergencyContactError("Please fill in all emergency contact fields or leave them all empty.");
        }
        return;
      }

      // Convert "none" to empty string before submission
      if (data.emergencyContact.relationship === "none") {
        data.emergencyContact.relationship = "";
      }

      await onSave(data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "An error occurred while saving.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const relationships = ["Father", "Mother", "Sister", "Brother", "Son", "Daughter", "Friend", "Relative", "Other"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
              <Stethoscope className="h-5 w-5 mr-2 text-indigo-600" />
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
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            {...form.register(`allergies.${index}`)}
                            className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex-1"
                            placeholder={`Allergy ${index + 1}`}
                            aria-label={`Allergy ${index + 1}`}
                          />
                        </FormControl>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
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
                      onClick={() => append("")}
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
                  <Select onValueChange={field.onChange} value={field.value || ""}>
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
                          onChange={handleSearchChange}
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
                      <User2 className="h-4 w-4 text-blue-700" />
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
                      <User2 className="h-4 w-4 text-blue-700" />
                    </div>
                    Relationship
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
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
            disabled={isSubmitting || doctorsLoading}
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
};

export default ViewPatientStep2;