import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../services/api.service";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {IdCard,IdCardIcon, UserCircle2Icon,UserCircle,UserCircle2,UserCircleIcon,CalendarIcon, User2, Loader2,Smartphone, Mail, Home, Circle, ArrowLeft, Pencil, Save, X } from "lucide-react";
import MedicalHistory from "./MedicalHistory";
import { Input } from "@/components/ui/input";
import TreatmentPlans from "../TreatmentPlans";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [patient, setPatient] = useState(null);
   const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     const [age, setAge] = useState(0);

console.log(id)
  const form = useForm({
    defaultValues: {
      fullName: "",
      nic: "",
      birthDate: "",
      gender: "",
      contactNumber: "",
      email: "",
      address: "",
    },
  });
const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  useEffect(() => {
    setLoading(true);
    const fetchPatientData = async () => {
    
      try {
        const response = await api.get(`/v2/patients/${id}`);
        if (response.status === 200) {
          setPatient(response.data.patient);
          form.reset(response.data.patient);
          setAge(response.data.patient.age || 0);
        }
      } catch (error) {
        toast.error("Failed to fetch patient details.", {
          position: "top-right",
          autoClose: 3000, 
        })
      }finally {
        setLoading(false);
      }
    };

    if (id) fetchPatientData();
  }, [id, form]);
  console.log(patient)

  const handleBirthDateChange = (e) => {
    const newBirthDate = e.target.value;
    if (newBirthDate) {
      const newAge = calculateAge(newBirthDate);
      setAge(newAge);
    } else {
      setAge(0);
    }
  };

  const handleEditToggle = (e) => {
    e.preventDefault();
    setIsEditing(!isEditing);
    if (isEditing) {
      setAge(patient.age || 0);
    }
  };

  const handleSave = async (data) => {
    try {
      await api.put(`/v2/patients/edit/${id}`, data);
      toast.success("Patient details updated successfully", {
        position: "top-right",
              autoClose: 3000,
            })
      setIsEditing(false);
      setPatient((prev) => ({ ...prev, ...data }));
      setAge(calculateAge(data.birthDate));
    } catch (error) {
      if (error.response) {
        const { errorCode, message } = error.response.data;
        if (errorCode === "PATIENT_NOT_FOUND") {
          toast.error("Patient not found.", {
            position: "top-right",
            autoClose: 3000, 
          })
        }else if (errorCode === "DUPLICATE_NIC") {
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

  console.log(id)

  return (
    <div className=" bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-2xl rounded-2xl overflow-hidden border-0 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-white py-8 px-6">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                  <UserCircle2Icon className="h-8 w-8" />
                  {patient ? `${patient.fullName}'s Profile` : "Loading..."}
                </CardTitle>
              
                <Button
                  onClick={() => navigate(-1)}
                  className="bg-white/20 hover:bg-white/30 rounded-full px-4 py-2"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Back
                </Button>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-white/10 rounded-full p-1">
                {["personal", "medical", "treatment"].map((tab) => (
                  <Button
                    key={tab}
                    variant="ghost"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-full py-2 text-sm font-medium capitalize ${
                      activeTab === tab
                        ? "bg-white text-teal-600 shadow-md"
                        : "text-white hover:bg-white/20"
                    } transition-all duration-200`}
                  >
                    {tab === "personal" ? "Personal Details" : tab === "medical" ? "Medical Records" : "Treatment Plans"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          {/* Tab Content */}
          {activeTab === "personal" && (
  <CardContent className="p-8 bg-white">
    {loading ? (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
      </div>
    ) : error ? (
      <div className="p-6 bg-red-50 text-red-600 rounded-lg text-center">{error}</div>
    ) : (
      <>
       <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-teal-50 rounded-xl shadow-lg">
    
        <h2 className="text-3xl font-semibold text-teal-800 flex items-center gap-3">
          <User2 className="h-7 w-7 text-teal-600" /> Patient Personal Details
        </h2>
        <div className="text-xl text-gray-500 mb-4">Patient ID: {patient.patientId}</div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <User2 className="h-5 w-5 text-teal-500" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className="rounded-lg border-gray-300 focus:ring-teal-400"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <IdCardIcon className="h-5 w-5 text-teal-500" />
                      NIC Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className="rounded-lg border-gray-300 focus:ring-teal-400"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-teal-500" />
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        value={field.value?.split("T")[0] || ""}
                        onChange={(e) => {
                          field.onChange(e); // Update form value
                          if (isEditing) {
                            handleBirthDateChange(e); // Update age dynamically
                          }
                        }}
                        disabled={!isEditing}
                        className="rounded-lg border-gray-300 focus:ring-teal-400"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-sm font-medium">
                              {age || 0}
                            </div>
                            </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <Circle className="h-5 w-5 text-teal-500" />
                      Gender
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="rounded-lg border-gray-300 focus:ring-teal-400">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-lg shadow-lg">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

<FormField
  control={form.control}
  name="contactNumber"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-gray-700 flex items-center gap-2">
        <Smartphone className="h-5 w-5 text-teal-500" />
        Phone Number
      </FormLabel>
      <FormControl>
        <Input
          {...field}
          disabled={!isEditing} // Disables input based on the `isEditing` state
          className="rounded-lg border-gray-300 focus:ring-teal-400"
          onChange={(e) => {
            const numericValue = e.target.value.replace(/\D/g, ''); // Removes non-numeric characters
            field.onChange(numericValue); // Only numeric values are allowed
          }}
        />
      </FormControl>
    </FormItem>
  )}
/>

 
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-teal-500" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className="rounded-lg border-gray-300 focus:ring-teal-400"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <Home className="h-5 w-5 text-teal-500" />
                      Full Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className="rounded-lg border-gray-300 focus:ring-teal-400"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6 bg-gray-200" />

            <div className="flex justify-center gap-4">
              {isEditing ? (
                <>
                  <Button
                    type="submit"
                    className="bg-teal-500 hover:bg-teal-600 rounded-full px-6 py-2 text-white shadow-md transition-all duration-200"
                  >
                    <Save className="mr-2 h-5 w-5" /> Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="rounded-full border-teal-500 text-teal-500 hover:bg-teal-50 transition-all duration-200"
                  >
                    <X className="mr-2 h-5 w-5" /> Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEditToggle}
                  className="bg-teal-500 hover:bg-teal-600 rounded-full px-6 py-2 text-white shadow-md transition-all duration-200"
                >
                  <Pencil className="mr-2 h-5 w-5" /> Edit Profile
                </Button>
              )}
            </div>
          </form>
        </Form>
       
        </div>
      </>
    )}
  </CardContent>
)}


          {activeTab === "medical" && (
            <CardContent className="p-8 bg-white">
              <MedicalHistory patientId={patient.patientId} />
            </CardContent>
          )}

          {activeTab === "treatment" && (
            <CardContent className="p-8 bg-white">
              <TreatmentPlans />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default View;