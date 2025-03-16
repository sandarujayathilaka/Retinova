import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { IdCardIcon, CalendarIcon, User2, Smartphone, Mail, Home, Circle, Loader2, ChevronRight, Save, X } from "lucide-react";
import { step1Schema,step2Schema } from "../CommonFiles/patientSchemas";
import PropTypes from "prop-types";

const ViewPatientStep1 = ({ initialData, step2Data, onNext, onSave, onCancel, isSubmitting }) => {
  const form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData || {
      fullName: "",
      nic: "",
      birthDate: "",
      gender: "",
      contactNumber: "",
      email: "",
      address: "",
    },
  });

  const isStep2Valid = step2Data ? step2Schema.safeParse(step2Data).success : false;
  const isStep1Valid = form.formState.isValid;

  const handleNext = (data) => onNext(data);
  const handleSave = (data) => onSave(data);

  return (
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
                    {...field}
                    className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    aria-label="Full Name"
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
                    {...field}
                    className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    aria-label="NIC Number"
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
                <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CalendarIcon className="h-4 w-4 text-blue-700" />
                  </div>
                  Date of Birth<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    aria-label="Date of Birth"
                  />
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
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
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
                    {...field}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      field.onChange(numericValue);
                    }}
                    className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    aria-label="Phone Number"
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
                    {...field}
                    className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    aria-label="Email Address"
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
                <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Home className="h-4 w-4 text-blue-700" />
                  </div>
                  Full Address<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    aria-label="Full Address"
                  />
                </FormControl>
                <FormMessage className="text-red-500 font-medium" />
              </FormItem>
            )}
          />
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
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300"
            aria-label="Go to next step"
          >
            <span className="flex items-center">
              Next Step
              <ChevronRight className="ml-2 h-4 w-4" />
            </span>
          </Button>
          {isStep1Valid && isStep2Valid && (
            <Button
              type="button"
              onClick={form.handleSubmit(handleSave)}
              disabled={isSubmitting}
              className="h-12 px-6 rounded-full bg-blue-900 hover:bg-blue-800 text-white font-semibold transition-all duration-300"
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
          )}
        </div>
      </form>
    </Form>
  );
};

ViewPatientStep1.propTypes = {
  initialData: PropTypes.object,
  step2Data: PropTypes.object,
  onNext: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

export default ViewPatientStep1;