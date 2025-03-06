import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { useEffect } from "react";

export default function StaffInfoComponent() {
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
