import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { api } from "../../../services/api.service";
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
import { Droplet, Ruler, Scale, AlertTriangle, Stethoscope, Phone, User2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

// Ensure all required fields are marked as required in the schema
const step2Schema = z.object({
  bloodType: z.string().optional(),
  height: z.number().min(0, { message: "Height cannot be negative" }).optional().or(z.literal("")),
  weight: z.number().min(0, { message: "Weight cannot be negative" }).optional().or(z.literal("")),
  allergies: z.array(z.string()).optional(),
  primaryPhysician: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(1, { message: "Emergency contact name is required." }),
    relationship: z.string().min(1, { message: "Relationship is required." }),
    phone: z
      .string()
      .min(1, { message: "Phone number is required." })
      .regex(/^\d{10}$/, { message: "Phone number must be 10 digits." }),
  }),
});

const ViewPatientStep2 = ({ initialData, onPrevious, onSave, onCancel, isSubmitting }) => {
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
        relationship:
          initialData?.emergencyContact?.relationship
            ?.charAt(0)
            .toUpperCase() +
          (initialData?.emergencyContact?.relationship?.slice(1) || "").toLowerCase() ||
          "",
        phone: initialData?.emergencyContact?.phone || "",
      },
    },
  });

  useEffect(() => {
    form.reset({
      bloodType: initialData?.bloodType || "",
      height: initialData?.height || "",
      weight: initialData?.weight || "",
      allergies: initialData?.allergies || [],
      primaryPhysician: initialData?.primaryPhysician || "",
      emergencyContact: {
        name: initialData?.emergencyContact?.name || "",
        relationship:
          initialData?.emergencyContact?.relationship
            ?.charAt(0)
            .toUpperCase() +
          (initialData?.emergencyContact?.relationship?.slice(1) || "").toLowerCase() ||
          "",
        phone: initialData?.emergencyContact?.phone || "",
      },
    });
  }, [initialData, form]);

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
      form.setValue(
        "allergies",
        updatedFields.map((field) => field.value).filter(Boolean)
      );
    }
  };

  const handleAllergyChange = (id, value) => {
    const updatedFields = allergyFields.map((field) =>
      field.id === id ? { ...field, value } : field
    );
    setAllergyFields(updatedFields);
    form.setValue(
      "allergies",
      updatedFields.map((field) => field.value).filter(Boolean)
    );
  };

  const onSubmit = (data) => {
    onSave(data);
  };

  const handlePrevious = () => {
    const currentData = form.getValues();
    const updatedData = {
      ...currentData,
      allergies: allergyFields.map((field) => field.value).filter(Boolean),
    };
    onPrevious(updatedData);
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const relationships = ["Father", "Mother", "Sister", "Brother", "Son", "Daughter", "Friend", "Relative", "Other"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="bloodType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-teal-500" />
                  Blood Type
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="rounded-lg border-gray-300 focus:ring-teal-400">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white rounded-lg shadow-lg">
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
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-teal-500" />
                  Height (cm)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : "")
                    }
                    className="rounded-lg border-gray-300 focus:ring-teal-400"
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
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-teal-500" />
                  Weight (kg)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : "")
                    }
                    className="rounded-lg border-gray-300 focus:ring-teal-400"
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
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-teal-500" />
                  Allergies
                </FormLabel>
                <div className="flex flex-wrap gap-4">
                  {allergyFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/3"
                    >
                      <FormControl>
                        <Input
                          placeholder={`Allergy ${index + 1}`}
                          value={field.value}
                          onChange={(e) => handleAllergyChange(field.id, e.target.value)}
                          className="h-10 rounded-lg border-gray-300 focus:ring-teal-400 flex-1"
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
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-500" />
                  Primary Physician
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="rounded-lg border-gray-300 focus:ring-teal-400">
                      <SelectValue placeholder="Select physician" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <Input
                        placeholder="Search doctors..."
                        value={searchTerm}
                        onChange={handleDoctorSearch}
                        className="h-10 rounded-lg border-gray-300 focus:ring-teal-400"
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
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <User2 className="h-5 w-5 text-teal-500" />
                  Emergency Contact Name<span className="text-red-500">*</span>
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
            name="emergencyContact.relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <User2 className="h-5 w-5 text-teal-500" />
                  Relationship to Patient<span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="rounded-lg border-gray-300 focus:ring-teal-400">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white rounded-lg shadow-lg">
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
                <FormLabel className="text-gray-700 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-teal-500" />
                  Emergency Contact Phone<span className="text-red-500">*</span>
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
            type="button"
            onClick={handlePrevious}
            disabled={isSubmitting}
            className="bg-gray-500 hover:bg-gray-600 rounded-full px-6 py-2 text-white shadow-md transition-all duration-200"
          >Previous
          </Button>
         
          <Button
            type="submit"
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
        </div>
      </form>
    </Form>
  );
};

export default ViewPatientStep2;