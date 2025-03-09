import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useFieldArray, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { defineStepper } from "@stepperize/react";
import { format } from "date-fns";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { CalendarIcon, Clock, Mail, Phone, PlusCircle, PlusIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FaUserPen } from "react-icons/fa6";
import { MdOutlineEventRepeat } from "react-icons/md";
import { PiClockClockwiseBold } from "react-icons/pi";
import { TbClockX } from "react-icons/tb";

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
                {stepper.all.map((step, index, array) => (
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
      <div className="gap-3 flex items-center">
        <Avatar className="size-14">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        </Avatar>
        <div className="flex flex-col justify-between gap-1">
          <div className="flex gap-2 items-center">
            <Button variant="ghost2" className="text-main">
              Upload Photo
            </Button>
            <Separator orientation="vertical" className="min-h-6 w-[1.5px]" />
            <Button
              variant="ghost2"
              className="text-destructive"
              onClick={e => {
                e.preventDefault();
              }}
            >
              Delete
            </Button>
          </div>
          <p className="text-xs text-slate-500 ml-4">
            An image of the person, it's best if it has the same height and width.
          </p>
        </div>
      </div>

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

  const maxChars = 200;
  const addressValue = watch("address", ""); // Watch the address field

  return (
    <div className="space-y-4 text-start">
      <div className="space-y-2">
        <label htmlFor={register("phone").name} className="block text-sm font-medium text-primary">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <Input
            id={register("phone").name}
            {...register("phone")}
            className="block w-full p-2 pl-10 border rounded-md"
          />
        </div>
        {errors.phone && <span className="text-sm text-destructive">{errors.phone.message}</span>}
      </div>
      <div className="space-y-2">
        <label htmlFor={register("email").name} className="block text-sm font-medium text-primary">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <Input
            id={register("email").name}
            {...register("email")}
            className="block w-full p-2 pl-10 border rounded-md"
          />
        </div>
        {errors.email && <span className="text-sm text-destructive">{errors.email.message}</span>}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <label
            htmlFor={register("address").name}
            className="block text-sm font-medium text-primary"
          >
            Address
          </label>
          <span className="text-[10px] leading-3 text-slate-400">
            {addressValue.length} / {maxChars}
          </span>
        </div>
        <Textarea
          id={register("address").name}
          {...register("address")}
          className="block w-full p-2 border rounded-md max-h-[200px]"
          maxLength={maxChars}
        />
        {errors.address && (
          <span className="text-sm text-destructive">{errors.address.message}</span>
        )}
      </div>
    </div>
  );
}

function WorkingHoursComponent() {
  const { control, watch } = useFormContext();

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeIntervals = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // Start from 08:00 AM
    const period = hour < 12 ? "AM" : "PM";
    const formattedHour = hour > 12 ? hour - 12 : hour; // Convert to 12-hour format
    return `${formattedHour}:00 ${period}`;
  });

  console.log(watch("workingHours"));
  return (
    <div className="space-y-4 text-start flex flex-col gap-1">
      {daysOfWeek.map((day, index) => {
        const isWorking = watch(`workingHours.${day}.enabled`); // Ensure proper string interpolation

        return (
          <div key={day} className="space-y-4">
            <div className="flex justify-between items-center">
              {/* Switch for Day Selection */}
              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name={`workingHours.${day}.enabled`}
                  render={({ field }) => (
                    <Switch
                      id={day.toLowerCase()}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className={`data-[state=checked]:bg-main`}
                    />
                  )}
                />
                <Label htmlFor={day.toLowerCase()}>{day}</Label>
              </div>

              {isWorking ? (
                <div className="flex space-x-2 items-center">
                  {/* Controlled Select for Start Time */}
                  <Controller
                    control={control}
                    name={`workingHours.${day}.startTime`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-[110px] flex items-center gap-1 text-sm px-1.5">
                          <Clock size={16} className="text-gray-500" />
                          <SelectValue placeholder="Start" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {timeIntervals.map(time => (
                              <SelectItem key={`start-${day}-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <span>to</span>

                  {/* Controlled Select for End Time */}
                  <Controller
                    control={control}
                    name={`workingHours.${day}.endTime`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-[110px] flex items-center gap-1 text-sm px-1.5">
                          <Clock size={16} className="text-gray-500" />
                          <SelectValue placeholder="End" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {timeIntervals.map(time => (
                              <SelectItem key={`end-${day}-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-500">Not working on this day</span>
              )}
            </div>

            {/* Hide separator for last item */}
            {index !== daysOfWeek.length - 1 && (
              <Separator orientation="horizontal" className="my-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DaysOffComponent() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useFormContext();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "daysOff",
  });

  const [selectedDay, setSelectedDay] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const formValues = watch();

  const handleAddDayOff = () => {
    const formData = watch();

    if (!formData.dayOffName || !formData.startDate || !formData.endDate) {
      console.error("Missing data:", formData);
      return;
    }

    if (isEditing && selectedDay !== null) {
      update(selectedDay, {
        dayOffName: formData.dayOffName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        repeatYearly: formData.repeatYearly || false,
      });
    } else {
      append({
        dayOffName: formData.dayOffName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        repeatYearly: formData.repeatYearly || false,
      });
    }

    // Reset state and close dialog
    setSelectedDay(null);
    setIsEditing(false);
    setIsAdding(false);

    // Clear input values
    setValue("dayOffName", "");
    setValue("startDate", null);
    setValue("endDate", null);
    setValue("repeatYearly", false);
  };

  const handleEditDayOff = index => {
    const day = fields[index];

    setValue("dayOffName", day.dayOffName);
    setValue("startDate", day.startDate);
    setValue("endDate", day.endDate);
    setValue("repeatYearly", day.repeatYearly);

    setSelectedDay(index);
    setIsEditing(true);
  };

  return (
    <div>
      {/* List of Days Off */}
      <div className="space-y-2">
        {fields.map((day, index) => (
          <div key={day.id} className="flex items-center gap-1">
            <div
              className="border p-2 rounded-md w-full cursor-pointer hover:bg-gray-100"
              onClick={() => handleEditDayOff(index)}
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="text-sm font-semibold">{day.dayOffName}</div>
                  <div className="text-sm text-gray-500">
                    {day.startDate ? format(new Date(day.startDate), "PPP") : "No Start Date"} -{" "}
                    {day.endDate ? format(new Date(day.endDate), "PPP") : "No End Date"}
                  </div>
                </div>
                {day.repeatYearly && (
                  <div className="flex gap-2">
                    <MdOutlineEventRepeat className="size-5" />
                    <div className="text-sm">Repeat yearly</div>
                  </div>
                )}
              </div>
            </div>

            {/* Delete Button */}
            <Trash2
              className="size-5 text-destructive/90 hover:text-destructive cursor-pointer"
              onClick={() => remove(index)}
            />
          </div>
        ))}
      </div>

      {/* Add Button */}
      <PlusCircle
        className="size-8 mt-3 text-gray-500 hover:text-gray-800 cursor-pointer"
        onClick={() => {
          setIsAdding(true);
          setIsEditing(false);
          setSelectedDay(null);

          setValue("dayOffName", "");
          setValue("startDate", null);
          setValue("endDate", null);
          setValue("repeatYearly", false);
        }}
      />

      {/* Reusable Add/Edit Dialog */}
      <Dialog
        open={isEditing || isAdding}
        onOpenChange={() => {
          setIsEditing(false);
          setIsAdding(false);
        }}
      >
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Day Off" : "Add Day Off"}</DialogTitle>
          </DialogHeader>

          <form className="space-y-4 text-start">
            {/* Day Off Name Field */}
            <div className="space-y-2">
              <label htmlFor="dayOffName" className="block text-sm font-medium text-primary">
                Day Off Name
              </label>
              <Input
                id="dayOffName"
                {...register("dayOffName", { required: "Day off name is required" })}
                className="block w-full p-2 border rounded-md"
              />
              {errors.dayOffName && (
                <span className="text-sm text-destructive">{errors.dayOffName.message}</span>
              )}
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-primary">Date</label>
              <div className="flex items-center gap-4">
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-1/2 justify-start text-left font-normal"
                        >
                          <CalendarIcon />
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                to
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-1/2 justify-start text-left font-normal"
                        >
                          <CalendarIcon />
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </div>

            {/* Repeat Yearly Switch */}
            <div className="flex items-center space-x-2">
              <Controller
                name="repeatYearly"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="repeat-yearly"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="repeat-yearly">Repeat this day off yearly</Label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsAdding(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={e => {
                  e.preventDefault();
                  handleAddDayOff();
                }}
              >
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Add;
