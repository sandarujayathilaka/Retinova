import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { defineStepper } from "@stepperize/react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

import { Loader2, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaUserPen } from "react-icons/fa6";
import { PiClockClockwiseBold } from "react-icons/pi";
import { TbClockX } from "react-icons/tb";
import { RiContactsLine } from "react-icons/ri";

import ContactInfoComponent, {
  contactInfoSchema,
} from "@/pages/admin/nurse-stepper/ContactInfoComponent";
import DaysOffComponent from "@/pages/admin/nurse-stepper/DaysOffComponent";
import StaffInfoComponent, {
  staffInfoSchema,
} from "@/pages/admin/nurse-stepper/StaffInfoComponent";
import WorkingHoursComponent, {
  workingHoursSchema,
} from "@/pages/admin/nurse-stepper/WorkingHoursComponent";
import { useAddNurse, useGetNurseById, useUpdateNurse } from "@/services/nurse.service";

const { useStepper, steps, utils } = defineStepper(
  { id: "staffInfo", label: "Staff Info", icon: <FaUserPen />, schema: staffInfoSchema },
  { id: "contactInfo", label: "Contact Info", icon: <RiContactsLine />, schema: contactInfoSchema },
  {
    id: "workingHours",
    label: "Working Hours",
    icon: <PiClockClockwiseBold />,
    schema: workingHoursSchema,
  },
  { id: "daysOff", label: "Days Off", icon: <TbClockX className="w-40" />, schema: z.object({}) },
);

function NurseForm({ mode = "add", nurseId = null, trigger, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const stepper = useStepper();
  const currentIndex = utils.getIndex(stepper.current.id);

  // Fetch nurse data if in edit mode
  const { data: nurse, isLoading } = useGetNurseById(nurseId, {
    enabled: mode === "edit" && Boolean(nurseId) && (mode === "edit" ? open : isOpen),
  });

  // Initialize a ref to keep track of form data across steps
  const formDataRef = React.useRef({});

  // Create a form instance for the current step
  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(stepper.current.schema),
    defaultValues: {
      workingHours: {
        Monday: { enabled: false },
        Tuesday: { enabled: false },
        Wednesday: { enabled: false },
        Thursday: { enabled: false },
        Friday: { enabled: false },
        Saturday: { enabled: false },
        Sunday: { enabled: false },
      },
      image: { Location: "" },
    },
  });

  const mutationAdd = useAddNurse();
  const mutationUpdate = useUpdateNurse();

  const handleReset = () => {
    mode === "edit"
      ? form.reset(nurse)
      : form.reset({
          workingHours: {
            Monday: { enabled: false },
            Tuesday: { enabled: false },
            Wednesday: { enabled: false },
            Thursday: { enabled: false },
            Friday: { enabled: false },
            Saturday: { enabled: false },
            Sunday: { enabled: false },
          },
          image: { Location: "" },
          name: "",
        });
  };

  // Handle form submission for the current step
  const onSubmit = values => {
    // Store the current step's form values
    formDataRef.current[stepper.current.id] = values;

    if (stepper.isLast) {
      // Get complete form data
      const formData = form.getValues();

      // Choose operation based on mode
      if (mode === "edit" && nurseId) {
        // Update existing nurse
        mutationUpdate.mutate(
          { id: nurseId, data: formData },
          {
            onSuccess: data => {
              handleReset();
              stepper.reset();
              formDataRef.current = {};
              toast.success("Nurse updated successfully!");
              onOpenChange(false);
            },
            onError: error => {
              console.error(error);
              toast.error("Failed to update nurse. Please try again.");
            },
          },
        );
      } else {
        // Add new nurse
        mutationAdd.mutate(formData, {
          onSuccess: data => {
            handleReset();
            stepper.reset();
            formDataRef.current = {}; // Reset the formDataRef when stepper is reset
            toast.success("Nurse added successfully!");
            setIsOpen(false);
          },
          onError: error => {
            console.error(error);
            toast.error(
              error?.response?.data?.error?.message ??
                error?.response?.data?.error ??
                "Failed to add nurse. Please try again.",
            );
          },
        });
      }
    } else {
      stepper.next();
    }
  };

  // Handle back button click
  const handleBack = () => {
    // Store current form values even when going back
    const currentValues = form.getValues();
    formDataRef.current[stepper.current.id] = currentValues;

    // Navigate to previous step without validation
    stepper.prev();
  };

  // Fill the form with data when editing
  useEffect(() => {
    if (mode === "edit" && nurse && !isLoading) {
      form.reset(nurse);
      stepper.reset();
    }
  }, [nurse, isLoading, form, mode, open]);

  const handleDemo = () => {
    // Helper function to generate time in correct format within the valid range (8 AM - 7 PM)
    const getRandomTime = startHour => {
      const hour = Math.floor(Math.random() * (12 - startHour)) + startHour; // Random hour between startHour and 7 PM
      const period = hour < 12 ? "AM" : "PM";
      const formattedHour = hour > 12 ? hour - 12 : hour; // Convert to 12-hour format
      return `${formattedHour}:00 ${period}`;
    };

    const workingHours = {
      Monday: {
        enabled: Math.random() > 0.5,
        startTime: undefined,
        endTime: undefined,
      },
      Tuesday: {
        enabled: Math.random() > 0.5,
        startTime: undefined,
        endTime: undefined,
      },
      Wednesday: {
        enabled: true,
        startTime: getRandomTime(8), // Start from 8 AM
        endTime: getRandomTime(9), // End after 8 AM, within valid range
      },
      Thursday: {
        enabled: Math.random() > 0.5,
        startTime: undefined,
        endTime: undefined,
      },
      Friday: {
        enabled: true,
        startTime: getRandomTime(8), // Start from 8 AM
        endTime: getRandomTime(9), // End after 8 AM, within valid range
      },
      Saturday: {
        enabled: Math.random() > 0.5,
        startTime: undefined,
        endTime: undefined,
      },
      Sunday: {
        enabled: Math.random() > 0.5,
        startTime: undefined,
        endTime: undefined,
      },
    };

    // Adjust start and end times based on the 'enabled' state
    Object.keys(workingHours).forEach(day => {
      if (workingHours[day].enabled) {
        // If working hours are enabled, we assign start and end times within the valid range
        const startHour = Math.floor(Math.random() * 12) + 8; // Random start hour between 8 AM and 7 PM
        const endHour = Math.floor(Math.random() * (19 - startHour)) + startHour + 1; // End hour after start hour

        // Assign start and end times in 12-hour format
        workingHours[day].startTime = getRandomTime(startHour);
        workingHours[day].endTime = getRandomTime(endHour);
      }
    });

    // Set random type, name, specialist, phone, email, and address
    const formValues = {
      workingHours,
      type: Math.random() > 0.5 ? "Full time" : "Part time",
      name: `${["Smith", "Jones", "Taylor", "Brown", "Williams"][Math.floor(Math.random() * 5)]}`,
      specialty: [
        "Ophthalmic Nurse",
        "Ophthalmic Surgical Nurse",
        "Ophthalmic Nurse Practitioner",
        "Retina Nurse",
        "Glaucoma Nurse",
        "Pediatric Ophthalmic Nurse",
        "Cornea & External Disease Nurse",
        "Oculoplastic Nurse",
        "Ophthalmic Oncology Nurse",
        "Low Vision Rehabilitation Nurse",
      ][Math.floor(Math.random() * 10)],
      phone: `0${Math.floor(Math.random() * 10e8)}`,
      email: `test${Math.floor(Math.random() * 10000)}@example.com`,
      address: `123 ${["Main St", "Broadway", "Elm St", "High St", "Park Ave"][Math.floor(Math.random() * 5)]}`,
      image: { Location: "" },
    };

    // Set random days off
    formValues.daysOff = [
      {
        dayOffName: "Holiday",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        repeatYearly: Math.random() > 0.5,
      },
    ];

    // Update the form with random values
    form.reset(formValues);
  };

  return (
    <Dialog
      open={mode === "edit" ? open : isOpen}
      onOpenChange={mode === "edit" ? onOpenChange : setIsOpen}
    >
      <DialogTrigger asChild>
        {trigger ||
          (mode === "add" && (
            <Button variant="default" className="bg-violet-600 hover:bg-violet-700">
              <PlusIcon className="mr-1 h-4 w-4" />
              Add Nurse
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold text-violet-700">
            <FaUserPen className="mr-2 h-5 w-5" />
            {mode === "edit" ? "Edit Nurse" : "Add New Nurse"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the nurse's information using the form below."
              : "Complete all steps to add a new nurse to the system."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && mode === "edit" ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <span className="ml-3 text-slate-600">Loading nurse data...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  {/* Stepper Navigation */}
                  <nav aria-label="Checkout Steps" className="group my-4">
                    <ol
                      className="flex px-2 items-center justify-between gap-2"
                      aria-orientation="horizontal"
                    >
                      {stepper.all.map((step, index, array) => (
                        <React.Fragment key={step.id}>
                          <li
                            className={`${index <= currentIndex && "border border-dashed border-violet-600 p-1 rounded-full"}`}
                          >
                            <Button
                              type="button"
                              role="tab"
                              variant={index <= currentIndex ? "default" : "secondary"}
                              aria-current={stepper.current.id === step.id ? "step" : undefined}
                              aria-posinset={index + 1}
                              aria-setsize={steps.length}
                              aria-selected={stepper.current.id === step.id}
                              className={`flex size-10 p-0 items-center justify-center rounded-full ${
                                index <= currentIndex
                                  ? "bg-violet-600 text-white hover:bg-violet-700"
                                  : ""
                              }`}
                              onClick={async () => {
                                // Store current form values
                                const currentValues = form.getValues();
                                formDataRef.current[stepper.current.id] = currentValues;

                                // Only validate when moving forward
                                if (index > currentIndex) {
                                  const valid = await form.trigger();
                                  if (!valid) return;
                                  if (index - currentIndex > 1) return; // Prevent skipping steps forward
                                }

                                // Always allow going backward
                                stepper.goTo(step.id);
                              }}
                            >
                              {step.icon}
                            </Button>
                          </li>
                          {index < array.length - 1 && (
                            <Separator
                              className={`flex-1 self-center justify-self-center ${index < currentIndex ? "bg-violet-600" : "bg-gray-200"}`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </ol>
                    <ol
                      className="flex items-center mt-2 justify-between"
                      aria-orientation="horizontal"
                    >
                      {stepper.all.map((step, index) => (
                        <li
                          key={step.id}
                          className={`flex gap-4 flex-shrink-0 flex-col ${index === 1 && "ml-3"}`}
                        >
                          <span className="text-sm font-medium">{step.label}</span>
                        </li>
                      ))}
                    </ol>
                  </nav>

                  {/* Step Content with Scrolling */}
                  <div
                    className="py-4 px-2 flex-1 overflow-y-auto"
                    style={{
                      maxHeight: `calc(85vh - 240px)`,
                      // minHeight: "200px",
                    }}
                  >
                    {stepper.switch({
                      staffInfo: () => <StaffInfoComponent />,
                      contactInfo: () => <ContactInfoComponent mode={mode} />,
                      workingHours: () => <WorkingHoursComponent />,
                      daysOff: () => <DaysOffComponent />,
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-3">
                  {mode === "add" && (
                    <Button type="button" variant="outline" size="sm" onClick={handleDemo}>
                      Demo Data
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      stepper.reset();
                      handleReset();
                    }}
                  >
                    Reset
                  </Button>
                </div>

                <div className="flex justify-end gap-3">
                  {stepper.isFirst ? (
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                  ) : (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      Back
                    </Button>
                  )}

                  <Button
                    type="submit"
                    className={`min-w-[120px] ${
                      stepper.isLast
                        ? "bg-violet-600 hover:bg-violet-700"
                        : "bg-slate-700 hover:bg-slate-800"
                    }`}
                    disabled={mutationAdd.isPending || mutationUpdate.isPending}
                  >
                    {mutationAdd.isPending || mutationUpdate.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {mutationAdd.isPending || mutationUpdate.isPending
                      ? stepper.isLast
                        ? mode === "edit"
                          ? "Updating..."
                          : "Adding..."
                        : "Processing..."
                      : stepper.isLast
                        ? mode === "edit"
                          ? "Update Nurse"
                          : "Add Nurse"
                        : "Continue"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default NurseForm;
