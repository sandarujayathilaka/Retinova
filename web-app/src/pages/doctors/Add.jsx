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

import { PlusIcon } from "lucide-react";
import { FaUserPen } from "react-icons/fa6";
import { PiClockClockwiseBold } from "react-icons/pi";
import { TbClockX } from "react-icons/tb";
import ContactInfoComponent from "./stepper/ContactInfoComponent";
import DaysOffComponent from "./stepper/DaysOffComponent";
import StaffInfoComponent from "./stepper/StaffInfoComponent";
import WorkingHoursComponent from "./stepper/WorkingHoursComponent";

const staffInfoSchema = z.object({
  type: z.enum(["full-time", "part-time"]),
  name: z.string().min(0, "Name is required"),
  specialist: z.string().min(0, "Specialist is required"),
});

const contactInfoSchema = z.object({
  phone: z.string().min(0, "Phone is required"),
  email: z.string().min(0, "Email is required"),
  address: z.string().min(0, "Address is required"),
});

const workingHoursSchema = z.object({});

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
  const stepper = useStepper();

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(stepper.current.schema),
  });

  const onSubmit = values => {
    // biome-ignore lint/suspicious/noConsoleLog: <We want to log the form values>
    console.log(`Form values for step ${stepper.current.id}:`, values);
    if (stepper.isLast) {
      stepper.reset();
    } else {
      stepper.next();
    }
  };

  const currentIndex = utils.getIndex(stepper.current.id);

  return (
    <Dialog>
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
                          const valid = await form.trigger();
                          //must be validated
                          if (!valid) return;
                          //can't skip steps forwards but can go back anywhere if validated
                          if (index - currentIndex > 1) return;
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
                  {stepper.isFirst ? (
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                  ) : (
                    <Button variant="secondary" onClick={stepper.prev} disabled={stepper.isFirst}>
                      Back
                    </Button>
                  )}
                  <Button type="submit">{stepper.isLast ? "Complete" : "Next"}</Button>
                </div>
              ) : (
                <Button onClick={stepper.reset}>Reset</Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default Add;
