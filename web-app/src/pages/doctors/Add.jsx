import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { defineStepper } from "@stepperize/react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { PlusIcon } from "lucide-react";
import { FaUserPen } from "react-icons/fa6";
import { TbClockX } from "react-icons/tb";
import { PiClockClockwiseBold } from "react-icons/pi";
import { useEffect } from "react";

const staffInfoSchema = z.object({
  type: z.enum(["full-time", "part-time"]),
  name: z.string().min(1, "Name is required"),
  specialist: z.string().min(5, "Specialist is required"),
});

const contactInfoSchema = z.object({
  phone: z.string().min(10, "Phone is required"),
  email: z.string().email("Invalid email").min(5, "Email is required"),
  address: z.string().min(10, "Address is required"),
});

const paymentSchema = z.object({
  cardNumber: z.string().min(0, "Card number is required"),
  expirationDate: z.string().min(0, "Expiration date is required"),
  cvv: z.string().min(0, "CVV is required"),
});

const { useStepper, steps, utils } = defineStepper(
  { id: "staffInfo", label: "Staff Info", icon: <FaUserPen />, schema: staffInfoSchema },
  { id: "contactInfo", label: "Contact Info", icon: <FaUserPen />, schema: contactInfoSchema },
  {
    id: "workingHours",
    label: "Working Hours",
    icon: <PiClockClockwiseBold className="" />,
    schema: paymentSchema,
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
              <ol
                className="flex items-center mt-2 justify-between gap-2"
                aria-orientation="horizontal"
              >
                {stepper.all.map((step, index, array) => (
                  <li key={step.id} className="flex gap-4 flex-shrink-0 flex-col">
                    <span className="text-sm font-medium">{step.label}</span>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="space-y-4">
              {stepper.switch({
                staffInfo: () => <StaffInfoComponent />,
                contactInfo: () => <ContactInfoComponent />,
                workingHours: () => <PaymentComponent />,
                daysOff: () => <CompleteComponent />,
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

function StaffInfoComponent() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  // Set default value when the component mounts
  useEffect(() => {
    if (!watch("type")) {
      setValue("type", "full-time"); // Default to "full-time"
    }
  }, [watch, setValue]);

  return (
    <div className="space-y-4 text-start">
      <div className="space-y-2">
        <label htmlFor={register("type").name} className="block text-sm font-medium text-primary">
          Type
        </label>
        <div className="flex w-full gap-2">
          {/* Full Time */}
          <div
            className={`flex items-center p-2 space-x-2 w-1/2 border rounded-md cursor-pointer ${
              watch("type") === "full-time" ? "border-main" : ""
            }`}
            onClick={() => setValue("type", "full-time")}
          >
            <input
              type="radio"
              {...register("type")}
              value="full-time"
              checked={watch("type") === "full-time"}
              className="hidden"
            />
            <span className="w-4 h-4 border rounded-full flex items-center justify-center">
              {watch("type") === "full-time" && <div className="w-2 h-2 bg-main rounded-full" />}
            </span>
            <span>Full Time</span>
          </div>

          {/* Part Time */}
          <div
            className={`flex items-center p-2 space-x-2 w-1/2 border rounded-md cursor-pointer ${
              watch("type") === "part-time" ? "border-main" : ""
            }`}
            onClick={() => setValue("type", "part-time")}
          >
            <input
              type="radio"
              {...register("type")}
              value="part-time"
              checked={watch("type") === "part-time"}
              className="hidden"
            />
            <span className="w-4 h-4 border rounded-full flex items-center justify-center">
              {watch("type") === "part-time" && <div className="w-2 h-2 bg-main rounded-full" />}
            </span>
            <span>Part Time</span>
          </div>
        </div>
        {errors.type && <span className="text-sm text-destructive">{errors.type.message}</span>}
      </div>
      <div className="space-y-2">
        <label htmlFor={register("name").name} className="block text-sm font-medium text-primary">
          Name
        </label>
        <Input
          id={register("name").name}
          {...register("name")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.name && <span className="text-sm text-destructive">{errors.name.message}</span>}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register("specialist").name}
          className="block text-sm font-medium text-primary"
        >
          Specialist
        </label>
        <Input
          id={register("specialist").name}
          {...register("specialist")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.specialist && (
          <span className="text-sm text-destructive">{errors.specialist.message}</span>
        )}
      </div>
    </div>
  );
}

function ContactInfoComponent() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4 text-start">
      <div className="space-y-2">
        <label htmlFor={register("phone").name} className="block text-sm font-medium text-primary">
          Phone Number
        </label>
        <Input
          id={register("phone").name}
          {...register("phone")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.phone && <span className="text-sm text-destructive">{errors.phone.message}</span>}
      </div>
      <div className="space-y-2">
        <label htmlFor={register("email").name} className="block text-sm font-medium text-primary">
          Email Address
        </label>
        <Input
          id={register("email").name}
          {...register("email")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.phone && <span className="text-sm text-destructive">{errors.email.message}</span>}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register("address").name}
          className="block text-sm font-medium text-primary"
        >
          Address
        </label>
        <Input
          id={register("address").name}
          {...register("address")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.phone && <span className="text-sm text-destructive">{errors.address.message}</span>}
      </div>
    </div>
  );
}

function PaymentComponent() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4 text-start">
      <div className="space-y-2">
        <label
          htmlFor={register("cardNumber").name}
          className="block text-sm font-medium text-primary"
        >
          Card Number
        </label>
        <Input
          id={register("cardNumber").name}
          {...register("cardNumber")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.cardNumber && (
          <span className="text-sm text-destructive">{errors.cardNumber.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register("expirationDate").name}
          className="block text-sm font-medium text-primary"
        >
          Expiration Date
        </label>
        <Input
          id={register("expirationDate").name}
          {...register("expirationDate")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.expirationDate && (
          <span className="text-sm text-destructive">{errors.expirationDate.message}</span>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor={register("cvv").name} className="block text-sm font-medium text-primary">
          CVV
        </label>
        <Input
          id={register("cvv").name}
          {...register("cvv")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.cvv && <span className="text-sm text-destructive">{errors.cvv.message}</span>}
      </div>
    </div>
  );
}

function CompleteComponent() {
  return <div className="text-center">Thank you! Your order is complete.</div>;
}

export default Add;
