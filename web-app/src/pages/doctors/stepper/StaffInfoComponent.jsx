import { Controller, useFormContext } from "react-hook-form";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { useEffect } from "react";

export default function StaffInfoComponent() {
  const {
    register,
    setValue,
    watch,
    control,
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
        <Controller
          control={control}
          name={`specialist`}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a specialist" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ophthalmologist">Ophthalmologist</SelectItem>
                  <SelectItem value="optometrist">Optometrist</SelectItem>
                  <SelectItem value="retina_specialist">Retina Specialist</SelectItem>
                  <SelectItem value="cornea_specialist">Cornea Specialist</SelectItem>
                  <SelectItem value="glaucoma_specialist">Glaucoma Specialist</SelectItem>
                  <SelectItem value="pediatric_ophthalmologist">
                    Pediatric Ophthalmologist
                  </SelectItem>
                  <SelectItem value="neuro_ophthalmologist">Neuro-Ophthalmologist</SelectItem>
                  <SelectItem value="oculoplastic_surgeon">Oculoplastic Surgeon</SelectItem>
                  <SelectItem value="ocular_oncologist">Ocular Oncologist</SelectItem>
                  <SelectItem value="contact_lens_specialist">Contact Lens Specialist</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.specialist && (
          <span className="text-sm text-destructive">{errors.specialist.message}</span>
        )}
      </div>
    </div>
  );
}
