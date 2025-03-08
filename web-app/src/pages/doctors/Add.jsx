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
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAddDoctor } from "@/services/doctor.service";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaUserPen } from "react-icons/fa6";
import { PiClockClockwiseBold } from "react-icons/pi";
import { TbClockX } from "react-icons/tb";
import ContactInfoComponent from "./stepper/ContactInfoComponent";
import DaysOffComponent from "./stepper/DaysOffComponent";
import StaffInfoComponent from "./stepper/StaffInfoComponent";
import WorkingHoursComponent from "./stepper/WorkingHoursComponent";

const staffInfoSchema = z.object({
  type: z.enum(["Full time", "Part time"]),
  name: z.string().min(1, "Name is required"),
  specialist: z.enum(
    [
      "Ophthalmologist",
      "Optometrist",
      "Retina Specialist",
      "Cornea Specialist",
      "Glaucoma Specialist",
      "Pediatric Ophthalmologist",
      "Neuro-Ophthalmologist",
      "Oculoplastic Surgeon",
      "Ocular Oncologist",
      "Contact Lens Specialist",
    ],
    { message: "Specialist is required" },
  ),
  image: z.object({
    Location: z
      .string()
      .min(10, { message: "Please upload an image" }) // Image URL is required
      .url({ message: "Invalid image URL" }), // Check if it's a valid URL
  }),
});

const contactInfoSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number can't be longer than 15 digits")
    .regex(/^\d+$/, "Phone number must contain only numbers"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters long")
    .max(200, "Address can't be longer than 200 characters"),
});

// Define a schema for individual day's working hours
const workingDaySchema = z
  .object({
    enabled: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // If enabled is true, startTime must be present
    if (data.enabled && !data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required",
        path: ["startTime"],
      });
    }

    // If enabled is true, endTime must be present
    if (data.enabled && !data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Required",
        path: ["endTime"],
      });
    }
  });

// Define the working hours schema with validation for at least one working day
const workingHoursSchema = z.object({
  workingHours: z
    .object({
      Monday: workingDaySchema,
      Tuesday: workingDaySchema,
      Wednesday: workingDaySchema,
      Thursday: workingDaySchema,
      Friday: workingDaySchema,
      Saturday: workingDaySchema,
      Sunday: workingDaySchema,
    })
    .refine(
      data => {
        // At least one day should be enabled
        return Object.values(data).some(day => day.enabled);
      },
      {
        message: "At least one working day must be selected",
        path: ["day"],
      },
    ),
});

const { useStepper, steps, utils } = defineStepper(
  { id: "staffInfo", label: "Staff Info", icon: <FaUserPen />, schema: staffInfoSchema },
  { id: "contactInfo", label: "Contact Info", icon: <FaUserPen />, schema: contactInfoSchema },
  {
    id: "workingHours",
    label: "Working Hours",
    icon: <PiClockClockwiseBold />,
    schema: workingHoursSchema,
  },
  { id: "daysOff", label: "Days Off", icon: <TbClockX className="w-40" />, schema: z.object({}) },
);

function Add() {
  const [isOpen, setIsOpen] = useState(false); // Track the dialog state

  const stepper = useStepper();
  const currentIndex = utils.getIndex(stepper.current.id);

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

  const mutationAdd = useAddDoctor();

  const handleReset = () => {
    form.reset({
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
    });
  };

  // Handle form submission for the current step
  const onSubmit = values => {
    // Store the current step's form values
    formDataRef.current[stepper.current.id] = values;

    console.log(`Form values for step ${stepper.current.id}:`, values);

    if (stepper.isLast) {
      // Process the complete form data
      console.log("Complete form data:", form.getValues());

      // Call the mutation when reaching the last step
      mutationAdd.mutate(form.getValues(), {
        onSuccess: data => {
          console.log("Doctor added successfully:", data);
          handleReset();
          stepper.reset();
          // Reset the formDataRef when stepper is reset
          formDataRef.current = {};
          toast.success("Doctor added successfully!");
          setIsOpen(false); // This will close the dialog
        },
        onError: error => {
          console.error(error);
          toast.error("Failed to add doctor. Please try again.");
        },
      });
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
      name: `Dr. ${["Smith", "Jones", "Taylor", "Brown", "Williams"][Math.floor(Math.random() * 5)]}`,
      specialist: [
        "Ophthalmologist",
        "Optometrist",
        "Retina Specialist",
        "Cornea Specialist",
        "Glaucoma Specialist",
        "Pediatric Ophthalmologist",
        "Neuro-Ophthalmologist",
        "Oculoplastic Surgeon",
        "Ocular Oncologist",
        "Contact Lens Specialist",
      ][Math.floor(Math.random() * 10)],
      phone: `0${Math.floor(Math.random() * 10e10)}`,
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">
          <PlusIcon />
          Add Doctor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new doctor</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-6 border rounded-lg w-[450px]"
          >
            <nav aria-label="Checkout Steps" className="group my-4">
              <ol
                className="flex px-2 items-center justify-between gap-2"
                aria-orientation="horizontal"
              >
                {stepper.all.map((step, index, array) => (
                  <React.Fragment key={step.id}>
                    <li
                      className={`${index <= currentIndex && "border border-dashed border-main p-1 rounded-full"}`}
                    >
                      <Button
                        type="button"
                        role="tab"
                        variant={index <= currentIndex ? "primary" : "secondary"}
                        aria-current={stepper.current.id === step.id ? "step" : undefined}
                        aria-posinset={index + 1}
                        aria-setsize={steps.length}
                        aria-selected={stepper.current.id === step.id}
                        className="flex size-10 p-0 items-center justify-center rounded-full"
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
                        className={`flex-1 self-center justify-self-center ${index < currentIndex ? "bg-main" : "bg-gray-200"}`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </ol>
              <ol className="flex items-center mt-2 justify-between" aria-orientation="horizontal">
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
            <div className="space-y-4">
              {stepper.switch({
                staffInfo: () => <StaffInfoComponent />,
                contactInfo: () => <ContactInfoComponent />,
                workingHours: () => <WorkingHoursComponent />,
                daysOff: () => <DaysOffComponent />,
              })}
              {!stepper.isLast ? (
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="ghost" onClick={handleDemo}>
                    Demo
                  </Button>
                  {stepper.isFirst ? (
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleBack}
                      disabled={stepper.isFirst}
                    >
                      Back
                    </Button>
                  )}
                  <Button type="submit">{stepper.isLast ? "Complete" : "Next"}</Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      stepper.reset();
                      handleReset();
                    }}
                  >
                    Reset
                  </Button>
                  <Button type="submit" variant="primary">
                    Add Doctor
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default Add;
