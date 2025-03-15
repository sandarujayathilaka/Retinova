import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

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

import { useDeleteImage, useUploadImage } from "@/services/util.service";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export const staffInfoSchema = z.object({
  type: z.enum(["Full time", "Part time"], {
    message: "Type is required",
  }),
  name: z.string().min(1, "Name is required"),
  specialty: z.enum(
    [
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
      setValue("type", "Full time"); // Default to "Full time"
    }
  }, [watch, setValue]);

  console.log(errors);
  const mutationUpload = useUploadImage();
  const mutationDelete = useDeleteImage();

  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false); // Track loading state

  const handleUpload = event => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true); // Start loading
      mutationUpload.mutate(file, {
        onSuccess: data => {
          setLoading(false); // Stop loading
          setValue("image", data.data); // Save uploaded image
          event.target.value = ""; // Reset the input value
        },
        onError: error => {
          setLoading(false);
          console.error(error);
          toast.error("Upload failed! Please try again.");
        },
      });
    }
  };

  const handleDelete = () => {
    const imageKey = watch("image.Key");
    console.log(imageKey);
    if (!imageKey) return;

    mutationDelete.mutate(
      { key: imageKey },
      {
        onSuccess: () => {
          setValue("image", {
            Location: "",
            Key: "",
          });
          toast.success("Image deleted successfully!");
        },
        onError: error => {
          console.error(error);
          toast.error("Failed to delete image.");
        },
      },
    );
  };

  return (
    <div className="space-y-4 text-start">
      <div>
        <div className="gap-3 flex items-center">
          <Avatar className="size-14 ">
            <AvatarImage
              src={
                watch("image.Location") ||
                "https://static.vecteezy.com/system/resources/previews/003/337/584/large_2x/default-avatar-photo-placeholder-profile-icon-vector.jpg"
              }
              alt="Staff Avatar"
              className={` ${loading ? "opacity-50" : ""}`} // Reduce opacity when loading
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                <Loader2 className="animate-spin text-main size-8" />
              </div>
            )}
          </Avatar>
          <div className="flex flex-col justify-between gap-1">
            <div className="flex gap-2 items-center">
              <input
                type="file"
                hidden
                ref={inputRef} // Attach the ref to the input
                onChange={handleUpload}
              />
              <Button
                variant="ghost2"
                onClick={e => {
                  e.preventDefault();
                  inputRef.current.click();
                }}
                className="text-main"
              >
                Upload Photo
              </Button>
              <Separator orientation="vertical" className="min-h-6 w-[1.5px]" />
              <Button
                variant="ghost2"
                className="text-destructive"
                onClick={e => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={!watch("image.Key")}
              >
                Delete
              </Button>
            </div>
            <p className="text-xs text-slate-500 ml-4">
              An image of the person, it's best if it has the same height and width.
            </p>
          </div>
        </div>
        {errors.image?.Location && (
          <span className="text-sm text-destructive">{errors.image.Location.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={register("type").name} className="block text-sm font-medium text-primary">
          Type
        </label>
        <div className="flex w-full gap-2">
          {/* Full Time */}
          <div
            className={`flex items-center p-2 space-x-2 w-1/2 border rounded-md cursor-pointer ${
              watch("type") === "Full time" ? "border-main" : ""
            }`}
            onClick={() => setValue("type", "Full time")}
          >
            <input
              type="radio"
              {...register("type")}
              value="Full Time"
              checked={watch("type") === "Full Time"}
              className="hidden"
            />
            <span className="w-4 h-4 border rounded-full flex items-center justify-center">
              {watch("type") === "Full time" && <div className="w-2 h-2 bg-main rounded-full" />}
            </span>
            <span>Full Time</span>
          </div>

          {/* Part Time */}
          <div
            className={`flex items-center p-2 space-x-2 w-1/2 border rounded-md cursor-pointer ${
              watch("type") === "Part time" ? "border-main" : ""
            }`}
            onClick={() => setValue("type", "Part time")}
          >
            <input
              type="radio"
              {...register("type")}
              value="Part time"
              checked={watch("type") === "Part time"}
              className="hidden"
            />
            <span className="w-4 h-4 border rounded-full flex items-center justify-center">
              {watch("type") === "Part time" && <div className="w-2 h-2 bg-main rounded-full" />}
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
          htmlFor={register("specialty").name}
          className="block text-sm font-medium text-primary"
        >
          Specialist
        </label>
        <Controller
          control={control}
          name={`specialty`}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a specialist" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Ophthalmic Nurse">Ophthalmic Nurse</SelectItem>
                  <SelectItem value="Ophthalmic Surgical Nurse">
                    Ophthalmic Surgical Nurse
                  </SelectItem>
                  <SelectItem value="Ophthalmic Nurse Practitioner">
                    Ophthalmic Nurse Practitioner
                  </SelectItem>
                  <SelectItem value="Retina Nurse">Retina Nurse</SelectItem>
                  <SelectItem value="Glaucoma Nurse">Glaucoma Nurse</SelectItem>
                  <SelectItem value="Pediatric Ophthalmic Nurse">
                    Pediatric Ophthalmic Nurse
                  </SelectItem>
                  <SelectItem value="Cornea & External Disease Nurse">
                    Cornea & External Disease Nurse
                  </SelectItem>
                  <SelectItem value="Oculoplastic Nurse">Oculoplastic Nurse</SelectItem>
                  <SelectItem value="Ophthalmic Oncology Nurse">
                    Ophthalmic Oncology Nurse
                  </SelectItem>
                  <SelectItem value="Low Vision Rehabilitation Nurse">
                    Low Vision Rehabilitation Nurse
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.specialty && (
          <span className="text-sm text-destructive">{errors.specialty.message}</span>
        )}
      </div>
    </div>
  );
}
