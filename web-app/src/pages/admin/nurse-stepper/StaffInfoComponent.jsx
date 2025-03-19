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
import { Loader2, Upload, Trash2 } from "lucide-react";
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
    <div className="space-y-5 text-start">
      {/* Photo Upload Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">Nurse Photo</label>
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-slate-200">
              <AvatarImage
                src={
                  watch("image.Location") ||
                  "https://static.vecteezy.com/system/resources/previews/003/337/584/large_2x/default-avatar-photo-placeholder-profile-icon-vector.jpg"
                }
                alt="Nurse Avatar"
                className={loading ? "opacity-50" : ""}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                  <Loader2 className="animate-spin text-violet-600 h-8 w-8" />
                </div>
              )}
            </Avatar>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <input type="file" hidden ref={inputRef} onChange={handleUpload} accept="image/*" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={e => {
                  e.preventDefault();
                  inputRef.current.click();
                }}
                className="h-8 px-2 text-violet-700"
              >
                <Upload className="mr-1 h-3.5 w-3.5" />
                Upload
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={e => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={!watch("image.Key")}
                className="h-8 px-2 text-red-700"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Upload a square image for best results (JPG, PNG, max 5MB)
            </p>
            {errors.image?.Location && (
              <p className="text-xs text-red-600 font-medium mt-1">
                {errors.image.Location.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-1" />

      {/* Employment Type Section */}
      <div className="space-y-3">
        <label htmlFor={register("type").name} className="block text-sm font-medium text-slate-700">
          Employment Type
        </label>
        <div className="flex w-full gap-3">
          {/* Full Time */}
          <div
            className={`flex items-center p-2.5 space-x-2 w-1/2 border rounded-md cursor-pointer transition-colors ${
              watch("type") === "Full time"
                ? "border-violet-600 bg-violet-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => setValue("type", "Full time")}
          >
            <span
              className={`w-4 h-4 border rounded-full flex items-center justify-center ${
                watch("type") === "Full time" ? "border-violet-600" : "border-slate-400"
              }`}
            >
              {watch("type") === "Full time" && (
                <div className="w-2 h-2 bg-violet-600 rounded-full" />
              )}
            </span>
            <span
              className={
                watch("type") === "Full time" ? "font-medium text-violet-900" : "text-slate-700"
              }
            >
              Full Time
            </span>
          </div>

          {/* Part Time */}
          <div
            className={`flex items-center p-2.5 space-x-2 w-1/2 border rounded-md cursor-pointer transition-colors ${
              watch("type") === "Part time"
                ? "border-violet-600 bg-violet-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
            onClick={() => setValue("type", "Part time")}
          >
            <span
              className={`w-4 h-4 border rounded-full flex items-center justify-center ${
                watch("type") === "Part time" ? "border-violet-600" : "border-slate-400"
              }`}
            >
              {watch("type") === "Part time" && (
                <div className="w-2 h-2 bg-violet-600 rounded-full" />
              )}
            </span>
            <span
              className={
                watch("type") === "Part time" ? "font-medium text-violet-900" : "text-slate-700"
              }
            >
              Part Time
            </span>
          </div>
        </div>
        {errors.type && (
          <p className="text-xs text-red-600 font-medium mt-1">{errors.type.message}</p>
        )}
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor={register("name").name} className="block text-sm font-medium text-slate-700">
          Full Name
        </label>
        <Input
          id={register("name").name}
          {...register("name")}
          placeholder="Enter nurse's full name"
          className={`${errors.name ? "border-red-300 focus-visible:ring-red-400" : ""}`}
        />
        {errors.name && (
          <p className="text-xs text-red-600 font-medium mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Specialty Field */}
      <div className="space-y-2">
        <label
          htmlFor={register("specialty").name}
          className="block text-sm font-medium text-slate-700"
        >
          Specialty
        </label>
        <Controller
          control={control}
          name={`specialty`}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger
                className={`w-full ${errors.specialty ? "border-red-300 focus-visible:ring-red-400" : ""}`}
              >
                <SelectValue placeholder="Select a specialty" />
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
          <p className="text-xs text-red-600 font-medium mt-1">{errors.specialty.message}</p>
        )}
      </div>
    </div>
  );
}
