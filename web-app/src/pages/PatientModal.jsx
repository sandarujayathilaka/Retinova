import { useState, useEffect } from "react";
import { api } from "../services/api.service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Form Schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  birthDate: z.string(),
  nic: z.string().min(10, { message: "NIC must be at least 10 characters." }),
  gender: z.enum(["Male", "Female", "Other"]),
  phoneNumber: z.string().min(10, { message: "Phone number is invalid." }),
  email: z.string().email({ message: "Invalid email address." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
});

const PatientModal = ({ patientId, closeModal }) => {
  const [patient, setPatient] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      nic: "",
      gender: "Male",
      phoneNumber: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    if (patientId) {
      const fetchPatient = async () => {
        try {
          const response = await api.get(`/patients/${patientId}`);
          setPatient(response.data);
          form.reset(response.data);
        } catch (error) {
          console.error("Error fetching patient data", error);
        }
      };
      fetchPatient();
    }
  }, [patientId]);

  const onSubmit = async (data) => {
    try {
      const response = await api.put(`/patients/${patientId}`, data);
      alert("Patient details updated successfully");
      closeModal(); // Close the modal after successful update
    } catch (error) {
      alert("Error updating patient details");
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={!!patientId} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Patient Details</DialogTitle>
        </DialogHeader>

        <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
          <form className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="nic" render={({ field }) => (
              <FormItem>
                <FormLabel>NIC</FormLabel>
                <FormControl>
                  <Input placeholder="NIC Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="birthDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Additional fields like gender, phone number, email, and address can be added similarly */}

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientModal;
