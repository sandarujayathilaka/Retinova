// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { useState, useEffect } from "react";
// import { api } from "../../../services/api.service";
// import { User2, Smartphone, Droplet, Ruler, Scale, AlertTriangle, Stethoscope, Phone, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { toast } from "react-hot-toast";
// import { step2Schema } from "../CommonFiles/patientSchemas";

// export default function AddPatientStep2({ step1Data, initialData, onPrevious, onSubmit, isSubmitting, formErrors, setResetForm }) {
//   const [doctors, setDoctors] = useState([]);
//   const [filteredDoctors, setFilteredDoctors] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [allergyFields, setAllergyFields] = useState(
//     initialData?.allergies?.length > 0
//       ? initialData.allergies.map((value, index) => ({ id: Date.now() + index, value }))
//       : [{ id: Date.now(), value: "" }]
//   );
//   const [hasShownToast, setHasShownToast] = useState(false); // Flag to prevent duplicate toasts

//   const form = useForm({
//     resolver: zodResolver(step2Schema),
//     defaultValues: {
//       bloodType: initialData?.bloodType || "",
//       height: initialData?.height || "",
//       weight: initialData?.weight || "",
//       allergies: initialData?.allergies || [],
//       primaryPhysician: initialData?.primaryPhysician || "",
//       emergencyContact: {
//         name: initialData?.emergencyContact?.name || "",
//         relationship: initialData?.emergencyContact?.relationship || "",
//         phone: initialData?.emergencyContact?.phone || "",
//       },
//     },
//   });

//   useEffect(() => {
//     let isMounted = true; // Flag to prevent state updates on unmounted component
//     setLoading(true); // Assuming setLoading is defined (added below)
//     setHasShownToast(false); // Reset toast flag on new effect run

//     const fetchDoctors = async () => {
//       try {
//         const response = await api.get("/doctors/names");
//         if (isMounted) {
//           setDoctors(response.data.doctors);
//           setFilteredDoctors(response.data.doctors);
//         }
//       } catch (error) {
//         console.error("Fetch Error:", error);
//         if (isMounted && !hasShownToast) {
//           toast.error("Failed to fetch doctors list.");
//           setHasShownToast(true); // Mark toast as shown
//         }
//       } finally {
//         if (isMounted) setLoading(false); // Assuming setLoading is defined
//       }
//     };

//     fetchDoctors();

//     // Cleanup function to prevent state updates on unmounted component
//     return () => {
//       isMounted = false;
//     };
//   }, []); // Empty dependency array since this runs only on mount

//   useEffect(() => {
//     // Pass the reset function to the parent component
//     setResetForm(() => () => {
//       form.reset({
//         bloodType: "",
//         height: "",
//         weight: "",
//         allergies: [],
//         primaryPhysician: "",
//         emergencyContact: {
//           name: "",
//           relationship: "",
//           phone: "",
//         },
//       });
//       setAllergyFields([{ id: Date.now(), value: "" }]); // Reset allergy fields
//     });
//   }, [form, setResetForm]);

//   const handleDoctorSearch = (e) => {
//     const term = e.target.value.toLowerCase();
//     setSearchTerm(term);
//     const filtered = doctors.filter((doctor) =>
//       doctor.name.toLowerCase().includes(term)
//     );
//     setFilteredDoctors(filtered);
//   };

//   const addAllergyField = () => {
//     setAllergyFields([...allergyFields, { id: Date.now(), value: "" }]);
//   };

//   const removeAllergyField = (id) => {
//     if (allergyFields.length > 1) {
//       const updatedFields = allergyFields.filter((field) => field.id !== id);
//       setAllergyFields(updatedFields);
//       form.setValue("allergies", updatedFields.map((field) => field.value).filter(Boolean));
//     }
//   };

//   const handleAllergyChange = (id, value) => {
//     const updatedFields = allergyFields.map((field) =>
//       field.id === id ? { ...field, value } : field
//     );
//     setAllergyFields(updatedFields);
//     form.setValue("allergies", updatedFields.map((field) => field.value).filter(Boolean));
//   };

//   const handlePrevious = () => {
//     const currentData = form.getValues();
//     onPrevious(currentData);
//   };

//   const handleSubmit = async (data) => {
//     try {
//       await onSubmit(data); // Call the parent's onSubmit and wait for it to resolve
//       // Let AddPatientWizard handle the reset on success
//     } catch (error) {
//       // If onSubmit rejects (error), do nothing—form retains values
//       console.log("Submission failed, form not reset:", error);
//     }
//   };

//   const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
//   const relationships = ["Father", "Mother", "Sister", "Brother", "Son", "Daughter", "Friend", "Relative", "Other"];

//   // Assuming setLoading is intended to be used (added to state)
//   const [loading, setLoading] = useState(false); // Added missing loading state

//   return (
//     <div className="bg-gray-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         <Card className="rounded-2xl overflow-hidden border-0">
//           <CardHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white py-8 px-6">
//             <div className="flex items-center justify-center space-x-4">
//               <User2 className="h-8 w-8" />
//               <CardTitle className="text-3xl font-extrabold tracking-tight">
//                 Register New Patient - Step 2
//               </CardTitle>
//             </div>
//           </CardHeader>

//           <CardContent className="p-8 bg-white">
//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <FormField
//                     control={form.control}
//                     name="bloodType"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
//                           <Droplet className="h-5 w-5 text-teal-500" />
//                           Blood Type
//                         </FormLabel>
//                         <Select onValueChange={field.onChange} value={field.value}>
//                           <FormControl>
//                             <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm">
//                               <SelectValue placeholder="Select blood type" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent className="bg-white rounded-lg shadow-lg border-gray-200">
//                             {bloodTypes.map((type) => (
//                               <SelectItem
//                                 key={type}
//                                 value={type}
//                                 className="py-2 hover:bg-teal-50 rounded-lg"
//                               >
//                                 {type}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage className="text-red-500 font-medium" />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="height"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
//                           <Ruler className="h-5 w-5 text-teal-500" />
//                           Height (cm)
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             placeholder="170"
//                             min={0}
//                             {...field}
//                             value={field.value}
//                             onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
//                             className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
//                           />
//                         </FormControl>
//                         <FormMessage className="text-red-500 font-medium" />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="weight"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
//                           <Scale className="h-5 w-5 text-teal-500" />
//                           Weight (kg)
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             placeholder="70"
//                             min={0}
//                             {...field}
//                             value={field.value}
//                             onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
//                             className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
//                           />
//                         </FormControl>
//                         <FormMessage className="text-red-500 font-medium" />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="allergies"
//                     render={() => (
//                       <FormItem className="md:col-span-2">
//                         <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
//                           <AlertTriangle className="h-5 w-5 text-teal-500" />
//                           Allergies
//                         </FormLabel>
//                         <div className="flex flex-wrap gap-8">
//                           {allergyFields.map((field, index) => (
//                             <div key={field.id} className="flex items-center gap-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
//                               <FormControl>
//                                 <Input
//                                   placeholder={`Allergy ${index + 1}`}
//                                   value={field.value}
//                                   onChange={(e) => handleAllergyChange(field.id, e.target.value)}
//                                   className="h-10 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm flex-1"
//                                 />
//                               </FormControl>
//                               {allergyFields.length > 1 && (
//                                 <Button
//                                   type="button"
//                                   variant="destructive"
//                                   size="sm"
//                                   onClick={() => removeAllergyField(field.id)}
//                                   className="h-10 px-3 text-sm"
//                                 >
//                                   Remove
//                                 </Button>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                         <Button
//                           type="button"
//                           variant="outline"
//                           onClick={addAllergyField}
//                           className="mt-2 h-10 px-4 text-sm border-teal-500 text-teal-500 hover:bg-teal-50 w-auto"
//                         >
//                           Add Another Allergy
//                         </Button>
//                         <FormMessage className="text-red-500 font-medium" />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="primaryPhysician"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
//                           <Stethoscope className="h-5 w-5 text-teal-500" />
//                           Primary Physician
//                         </FormLabel>
//                         <Select onValueChange={field.onChange} value={field.value}>
//                           <FormControl>
//                             <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm">
//                               <SelectValue placeholder="Select physician" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent className="bg-white rounded-lg shadow-lg border-gray-200 max-h-60 overflow-y-auto">
//                             <div className="p-2">
//                               <Input
//                                 placeholder="Search doctors..."
//                                 value={searchTerm}
//                                 onChange={handleDoctorSearch}
//                                 className="h-10 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
//                                 onClick={(e) => e.stopPropagation()}
//                               />
//                             </div>
//                             {filteredDoctors.length > 0 ? (
//                               filteredDoctors.map((doctor) => (
//                                 <SelectItem
//                                   key={doctor._id}
//                                   value={doctor._id}
//                                   className="py-2 hover:bg-teal-50 rounded-lg"
//                                 >
//                                   {doctor.name}
//                                 </SelectItem>
//                               ))
//                             ) : (
//                               <div className="p-2 text-gray-500">No doctors found</div>
//                             )}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage className="text-red-500 font-medium" />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="emergencyContact.name"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
//                           <User2 className="h-5 w-5 text-teal-500" />
//                           Emergency Contact Name<span className="text-red-500">*</span>
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="Jane Doe"
//                             {...field}
//                             className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
//                           />
//                         </FormControl>
//                         <FormMessage className="text-red-500 font-medium" />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="emergencyContact.relationship"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
//                           <User2 className="h-5 w-5 text-teal-500" />
//                           Relationship to Patient<span className="text-red-500">*</span>
//                         </FormLabel>
//                         <Select onValueChange={field.onChange} value={field.value}>
//                           <FormControl>
//                             <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm">
//                               <SelectValue placeholder="Select relationship" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent className="bg-white rounded-lg shadow-lg border-gray-200">
//                             {relationships.map((relationship) => (
//                               <SelectItem
//                                 key={relationship}
//                                 value={relationship}
//                                 className="py-2 hover:bg-teal-50 rounded-lg"
//                               >
//                                 {relationship}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage className="text-red-500 font-medium" />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="emergencyContact.phone"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
//                           <Phone className="h-5 w-5 text-teal-500" />
//                           Emergency Contact Phone<span className="text-red-500">*</span>
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="0771234567"
//                             {...field}
//                             value={field.value || ""}
//                             onChange={(e) => {
//                               const numericValue = e.target.value.replace(/\D/g, '');
//                               field.onChange(numericValue);
//                             }}
//                             className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-teal-400 bg-white shadow-sm"
//                           />
//                         </FormControl>
//                         <FormMessage className="text-red-500 font-medium" />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <Separator className="my-6 bg-gray-200" />

//                 <div className="flex justify-center gap-4">
//                   <Button
//                     type="button"
//                     onClick={handlePrevious}
//                     disabled={isSubmitting}
//                     className="h-14 px-12 rounded-full bg-gray-500 hover:bg-gray-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
//                   >
//                     Previous Page
                    
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="h-14 px-12 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 className="h-5 w-5 mr-2 animate-spin" />
//                         Saving...
//                       </>
//                     ) : (
//                       <>
//                         <User2 className="h-5 w-5 mr-2" />
//                         Register Patient
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </Form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { useState, useEffect } from "react";
// import { api } from "../../../services/api.service";
// import { User2, Smartphone, Droplet, Ruler, Scale, AlertTriangle, Stethoscope, Phone, Loader2, ChevronLeft, X, Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { toast } from "react-hot-toast";
// import { step2Schema } from "../CommonFiles/patientSchemas";
// import { useQuery } from '@tanstack/react-query';

// export default function AddPatientStep2({ step1Data, initialData, onPrevious, onSubmit, isSubmitting, formErrors, setResetForm }) {
//   const [doctors, setDoctors] = useState([]);
//   const [filteredDoctors, setFilteredDoctors] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [allergyFields, setAllergyFields] = useState(
//     initialData?.allergies?.length > 0
//       ? initialData.allergies.map((value, index) => ({ id: Date.now() + index, value }))
//       : [{ id: Date.now(), value: "" }]
//   );
//   const [hasShownToast, setHasShownToast] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const form = useForm({
//     resolver: zodResolver(step2Schema),
//     defaultValues: {
//       bloodType: initialData?.bloodType || "",
//       height: initialData?.height || "",
//       weight: initialData?.weight || "",
//       allergies: initialData?.allergies || [],
//       primaryPhysician: initialData?.primaryPhysician || "",
//       emergencyContact: {
//         name: initialData?.emergencyContact?.name || "",
//         relationship: initialData?.emergencyContact?.relationship || "",
//         phone: initialData?.emergencyContact?.phone || "",
//       },
//     },
//   });

//   useEffect(() => {
//     let isMounted = true;
//     setLoading(true);
//     setHasShownToast(false);

//     const fetchDoctors = async () => {
//       try {
//         const response = await api.get("/doctors/names");
//         if (isMounted) {
//           setDoctors(response.data.doctors);
//           setFilteredDoctors(response.data.doctors);
//         }
//       } catch (error) {
//         console.error("Fetch Error:", error);
//         if (isMounted && !hasShownToast) {
//           toast.error("Failed to fetch doctors list.");
//           setHasShownToast(true);
//         }
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchDoctors();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     // Pass the reset function to the parent component
//     setResetForm(() => () => {
//       form.reset({
//         bloodType: "",
//         height: "",
//         weight: "",
//         allergies: [],
//         primaryPhysician: "",
//         emergencyContact: {
//           name: "",
//           relationship: "",
//           phone: "",
//         },
//       });
//       setAllergyFields([{ id: Date.now(), value: "" }]);
//     });
//   }, [form, setResetForm]);

//   const handleDoctorSearch = (e) => {
//     const term = e.target.value.toLowerCase();
//     setSearchTerm(term);
//     const filtered = doctors.filter((doctor) =>
//       doctor.name.toLowerCase().includes(term)
//     );
//     setFilteredDoctors(filtered);
//   };

//   const addAllergyField = () => {
//     setAllergyFields([...allergyFields, { id: Date.now(), value: "" }]);
//   };

//   const removeAllergyField = (id) => {
//     if (allergyFields.length > 1) {
//       const updatedFields = allergyFields.filter((field) => field.id !== id);
//       setAllergyFields(updatedFields);
//       form.setValue("allergies", updatedFields.map((field) => field.value).filter(Boolean));
//     }
//   };

//   const handleAllergyChange = (id, value) => {
//     const updatedFields = allergyFields.map((field) =>
//       field.id === id ? { ...field, value } : field
//     );
//     setAllergyFields(updatedFields);
//     form.setValue("allergies", updatedFields.map((field) => field.value).filter(Boolean));
//   };

//   const handlePrevious = () => {
//     const currentData = form.getValues();
//     onPrevious(currentData);
//   };

//   const handleSubmit = async (data) => {
//     try {
//       await onSubmit(data);
//     } catch (error) {
//       console.log("Submission failed, form not reset:", error);
//     }
//   };

//   const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
//   const relationships = ["Father", "Mother", "Sister", "Brother", "Son", "Daughter", "Friend", "Relative", "Other"];
// // gradient-to-br from-blue-900 to-indigo-900
//   return (
//     <div className="bg-white min-h-screen p-6">
//       <div className="max-w-7xl mx-auto">
//         <Card className="rounded-3xl overflow-hidden border-0">
//           <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-10 px-8">
//             <div className="flex items-center justify-center space-x-4">
//               <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
//                 <User2 className="h-8 w-8 text-white" />
//               </div>
//               <div>
//                 <CardTitle className="text-3xl font-extrabold tracking-tight">
//                   Register New Patient
//                 </CardTitle>
//                 <p className="text-blue-200 mt-2 font-medium">Step 2: Medical Information</p>
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent className="p-8 bg-white">
//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div className="space-y-6">
//                     <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
//                       <Stethoscope className="h-5 w-5 mr-2 text-indigo-600" />
//                       Medical Details
//                     </h3>
                    
//                     <FormField
//                       control={form.control}
//                       name="bloodType"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
//                             <div className="bg-blue-100 p-2 rounded-full">
//                               <Droplet className="h-4 w-4 text-blue-700" />
//                             </div>
//                             Blood Type
//                           </FormLabel>
//                           <Select onValueChange={field.onChange} value={field.value}>
//                             <FormControl>
//                               <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
//                                 <SelectValue placeholder="Select blood type" />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent className="bg-white rounded-xl border-gray-200">
//                               {bloodTypes.map((type) => (
//                                 <SelectItem
//                                   key={type}
//                                   value={type}
//                                   className="py-3 hover:bg-blue-50 rounded-lg"
//                                 >
//                                   <span className={`font-semibold ${type.includes('+') ? 'text-red-600' : 'text-indigo-600'}`}>
//                                     {type}
//                                   </span>
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                           <FormMessage className="text-red-500 font-medium" />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormField
//                         control={form.control}
//                         name="height"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
//                               <div className="bg-blue-100 p-2 rounded-full">
//                                 <Ruler className="h-4 w-4 text-blue-700" />
//                               </div>
//                               Height (cm)
//                             </FormLabel>
//                             <FormControl>
//                               <Input
//                                 type="number"
//                                 placeholder="170"
//                                 min={0}
//                                 {...field}
//                                 value={field.value}
//                                 onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
//                                 className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                               />
//                             </FormControl>
//                             <FormMessage className="text-red-500 font-medium" />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="weight"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
//                               <div className="bg-blue-100 p-2 rounded-full">
//                                 <Scale className="h-4 w-4 text-blue-700" />
//                               </div>
//                               Weight (kg)
//                             </FormLabel>
//                             <FormControl>
//                               <Input
//                                 type="number"
//                                 placeholder="70"
//                                 min={0}
//                                 {...field}
//                                 value={field.value}
//                                 onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
//                                 className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                               />
//                             </FormControl>
//                             <FormMessage className="text-red-500 font-medium" />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
                    
//                     <FormField
//                       control={form.control}
//                       name="allergies"
//                       render={() => (
//                         <FormItem>
//                           <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
//                             <div className="bg-blue-100 p-2 rounded-full">
//                               <AlertTriangle className="h-4 w-4 text-blue-700" />
//                             </div>
//                             Allergies
//                           </FormLabel>
//                           <div className="space-y-3">
//                             {allergyFields.map((field, index) => (
//                               <div key={field.id} className="flex items-center gap-2">
//                                 <FormControl>
//                                   <Input
//                                     placeholder={`Allergy ${index + 1}`}
//                                     value={field.value}
//                                     onChange={(e) => handleAllergyChange(field.id, e.target.value)}
//                                     className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex-1"
//                                   />
//                                 </FormControl>
//                                 {allergyFields.length > 1 && (
//                                   <Button
//                                     type="button"
//                                     variant="ghost"
//                                     size="icon"
//                                     onClick={() => removeAllergyField(field.id)}
//                                     className="h-10 w-10 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
//                                   >
//                                     <X className="h-5 w-5" />
//                                   </Button>
//                                 )}
//                               </div>
//                             ))}
//                           </div>
//                           <Button
//                             type="button"
//                             variant="outline"
//                             onClick={addAllergyField}
//                             className="mt-3 h-10 px-4 text-sm border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl flex items-center gap-2"
//                           >
//                             <Plus className="h-4 w-4" />
//                             Add Another Allergy
//                           </Button>
//                           <FormMessage className="text-red-500 font-medium" />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="primaryPhysician"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
//                             <div className="bg-blue-100 p-2 rounded-full">
//                               <Stethoscope className="h-4 w-4 text-blue-700" />
//                             </div>
//                             Primary Physician
//                           </FormLabel>
//                           <Select onValueChange={field.onChange} value={field.value}>
//                             <FormControl>
//                               <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
//                                 <SelectValue placeholder="Select physician" />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent className="bg-white rounded-xl border-gray-200 max-h-60 overflow-y-auto">
//                               <div className="p-2">
//                                 <Input
//                                   placeholder="Search doctors..."
//                                   value={searchTerm}
//                                   onChange={handleDoctorSearch}
//                                   className="h-10 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                                   onClick={(e) => e.stopPropagation()}
//                                 />
//                               </div>
//                               {filteredDoctors.length > 0 ? (
//                                 filteredDoctors.map((doctor) => (
//                                   <SelectItem
//                                     key={doctor._id}
//                                     value={doctor._id}
//                                     className="py-2 hover:bg-blue-50 rounded-lg"
//                                   >
//                                     {doctor.name}
//                                   </SelectItem>
//                                 ))
//                               ) : (
//                                 <div className="p-2 text-gray-500">No doctors found</div>
//                               )}
//                             </SelectContent>
//                           </Select>
//                           <FormMessage className="text-red-500 font-medium" />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
                  
//                   <div className="space-y-6">
//                     <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
//                       <Phone className="h-5 w-5 mr-2 text-indigo-600" />
//                       Emergency Contact
//                     </h3>
                    
//                     <FormField
//                       control={form.control}
//                       name="emergencyContact.name"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
//                             <div className="bg-blue-100 p-2 rounded-full">
//                               <User2 className="h-4 w-4 text-blue-700" />
//                             </div>
//                             Contact Name
//                           </FormLabel>
//                           <FormControl>
//                             <Input
//                               placeholder="Jane Doe"
//                               {...field}
//                               className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                             />
//                           </FormControl>
//                           <FormMessage className="text-red-500 font-medium" />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="emergencyContact.relationship"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
//                             <div className="bg-blue-100 p-2 rounded-full">
//                               <User2 className="h-4 w-4 text-blue-700" />
//                             </div>
//                             Relationship
//                           </FormLabel>
//                           <Select onValueChange={field.onChange} value={field.value}>
//                             <FormControl>
//                               <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
//                                 <SelectValue placeholder="Select relationship" />
//                               </SelectTrigger>
//                             </FormControl>
//                             <SelectContent className="bg-white rounded-xl border-gray-200">
//                               {relationships.map((relationship) => (
//                                 <SelectItem
//                                   key={relationship}
//                                   value={relationship}
//                                   className="py-3 hover:bg-blue-50 rounded-lg"
//                                 >
//                                   {relationship}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                           <FormMessage className="text-red-500 font-medium" />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="emergencyContact.phone"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
//                             <div className="bg-blue-100 p-2 rounded-full">
//                               <Phone className="h-4 w-4 text-blue-700" />
//                             </div>
//                             Phone Number
//                           </FormLabel>
//                           <FormControl>
//                             <Input
//                               placeholder="0771234567"
//                               {...field}
//                               value={field.value || ""}
//                               onChange={(e) => {
//                                 const numericValue = e.target.value.replace(/\D/g, '');
//                                 field.onChange(numericValue);
//                               }}
//                               className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                             />
//                           </FormControl>
//                           <FormMessage className="text-red-500 font-medium" />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <div className="bg-blue-50 rounded-xl p-6 mt-6 border border-blue-100">
//                       <div className="flex items-start gap-3">
//                         <div className="bg-blue-600 rounded-full p-2 mt-1">
//                           <AlertTriangle className="h-4 w-4 text-white" />
//                         </div>
//                         <div>
//                           <h4 className="text-blue-900 font-semibold mb-1">Important</h4>
//                           <p className="text-sm text-blue-700">
//                           Providing emergency contact information is optional but recommended.
//                           This person will be contacted in case of medical emergencies if provided.
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <Separator className="my-6 bg-blue-100" />

//                 <div className="flex justify-center gap-6 pt-4">
//                   <Button
//                     type="button"
//                     onClick={handlePrevious}
//                     disabled={isSubmitting}
//                     className="h-14 px-12 rounded-full bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all duration-300 transform hover:scale-105"
//                   >
//                     <span className="flex items-center">
//                       <ChevronLeft className="mr-2 h-5 w-5" />
//                       Previous Step
//                     </span>
//                   </Button>
//                   <Button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="h-14 px-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300 transform hover:scale-105"
//                   >
//                     {isSubmitting ? (
//                       <span className="flex items-center">
//                         <Loader2 className="h-5 w-5 mr-2 animate-spin" />
//                         Saving...
//                       </span>
//                     ) : (
//                       <span className="flex items-center">
//                         <User2 className="h-5 w-5 mr-2" />
//                         Register Patient
//                       </span>
//                     )}
//                   </Button>
//                 </div>
//               </form>
//             </Form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

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
import { step2Schema } from "../CommonFiles/patientSchemas";
import PropTypes from "prop-types";

// Sub-component: Medical Details Section
const MedicalDetailsSection = ({ form, doctors, filteredDoctors, searchTerm, setSearchTerm, handleDoctorSearch }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "allergies",
  });

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="space-y-6">
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
  const formErrors = form.formState.errors;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
        <Phone className="h-5 w-5 mr-2 text-indigo-600" />
        Emergency Contact
      </h3>

      {/* General error message for emergencyContact */}
      {formErrors.emergencyContact && (
        <div className="text-red-500 font-medium">
          {formErrors.emergencyContact.message || "Please fill in all required emergency contact details."}
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
                placeholder="Jane Doe"
                {...field}
                className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                aria-label="Emergency contact name"
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
            <Select onValueChange={field.onChange} value={field.value}>
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
                value={field.value || ""}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, "");
                  field.onChange(numericValue);
                }}
                className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                aria-label="Emergency contact phone number"
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
    try {
      await onSubmit(data);
    } catch (error) {
      toast.error("Failed to register patient. Please try again.");
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
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
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
                      <ChevronLeft className="mr-2 h-5 w-5" />
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