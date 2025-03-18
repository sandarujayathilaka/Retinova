import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useAddAdmin, useGetAdminById, useUpdateAdmin } from "@/services/admin.service";
import { useDeleteImage, useUploadImage } from "@/services/util.service";
import { Loader2, Mail, PlusIcon, Upload, Trash2, UserCog } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export const adminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  image: z.object({
    Location: z
      .string()
      .min(10, { message: "Please upload an image" })
      .url({ message: "Invalid image URL" }),
    Key: z.string().optional(),
  }),
});

function AdminForm({ mode = "add", adminId = null, trigger, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch admin data if in edit mode
  const { data: admin, isLoading } = useGetAdminById(adminId, {
    enabled: mode === "edit" && Boolean(adminId) && (mode === "edit" ? open : isOpen),
  });

  // Create a form instance
  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: "",
      email: "",
      image: { Location: "", Key: "" },
    },
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = form;

  const mutationAdd = useAddAdmin();
  const mutationUpdate = useUpdateAdmin();

  const handleReset = () => {
    mode === "edit"
      ? form.reset(admin)
      : form.reset({
          name: "",
          email: "",
          image: { Location: "", Key: "" },
        });
  };

  const mutationUpload = useUploadImage();
  const mutationDelete = useDeleteImage();

  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = event => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      mutationUpload.mutate(file, {
        onSuccess: data => {
          setLoading(false);
          setValue("image", data.data);
          event.target.value = "";
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

  // Handle form submission
  const onSubmit = values => {
    const formData = form.getValues();

    if (mode === "edit" && adminId) {
      mutationUpdate.mutate(
        { id: adminId, data: formData },
        {
          onSuccess: data => {
            handleReset();
            toast.success("Admin updated successfully!");
            onOpenChange(false);
          },
          onError: error => {
            console.error(error);
            toast.error("Failed to update admin. Please try again.");
          },
        },
      );
    } else {
      mutationAdd.mutate(formData, {
        onSuccess: data => {
          handleReset();
          toast.success("Admin added successfully!");
          setIsOpen(false);
        },
        onError: error => {
          console.error(error);
          toast.error(
            error?.response?.data?.error?.message ??
              error?.response?.data?.error ??
              "Failed to add admin. Please try again.",
          );
        },
      });
    }
  };

  // Fill the form with data when editing
  useEffect(() => {
    if (mode === "edit" && admin && !isLoading) {
      form.reset(admin);
    }
  }, [admin, isLoading, form, mode, open]);

  const handleDemo = () => {
    const formValues = {
      name: `${["Smith", "Jones", "Taylor", "Brown", "Williams"][Math.floor(Math.random() * 5)]}`,
      email: `test${Math.floor(Math.random() * 10000)}@example.com`,
      image: { Location: "", Key: "" },
    };

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
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <PlusIcon className="mr-1 h-4 w-4" />
              Add Admin
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold text-blue-700">
            <UserCog className="mr-2 h-5 w-5" />
            {mode === "edit" ? "Edit Administrator" : "Add New Administrator"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the administrator details below."
              : "Fill in the details to add a new administrator to the system."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && mode === "edit" ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-600">Loading administrator data...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Avatar Section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Profile Photo</label>
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16 border-2 border-slate-200">
                            <AvatarImage
                              src={
                                watch("image.Location") ||
                                "https://static.vecteezy.com/system/resources/previews/003/337/584/large_2x/default-avatar-photo-placeholder-profile-icon-vector.jpg"
                              }
                              alt="Admin Avatar"
                              className={loading ? "opacity-50" : ""}
                            />
                            {loading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                                <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
                              </div>
                            )}
                          </Avatar>
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="file"
                              hidden
                              ref={inputRef}
                              onChange={handleUpload}
                              accept="image/*"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={e => {
                                e.preventDefault();
                                inputRef.current.click();
                              }}
                              className="h-8 px-2 text-blue-700"
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
                            Upload a square profile photo (JPG or PNG, max 2MB)
                          </p>
                          {errors.image?.Location && (
                            <p className="text-xs text-red-600 font-medium mt-1">
                              {errors.image.Location.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Name Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="name-field"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Full Name
                      </label>
                      <Input
                        id="name-field"
                        {...register("name")}
                        placeholder="Enter administrator name"
                        className={`${errors.name ? "border-red-300 focus-visible:ring-red-400" : ""}`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email-field"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="email-field"
                          {...register("email")}
                          placeholder="admin@example.com"
                          className={`pl-9 ${errors.email ? "border-red-300 focus-visible:ring-red-400" : ""} ${mode === "edit" ? "bg-slate-50" : ""}`}
                          readOnly={mode === "edit"}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                          {errors.email.message}
                        </p>
                      )}
                      {mode === "edit" && (
                        <p className="text-xs text-slate-500">
                          Email addresses cannot be changed after creation.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {mode === "add" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDemo}
                      className="text-slate-700"
                    >
                      Demo Data
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={!isDirty}
                    className="text-slate-700"
                  >
                    Reset
                  </Button>
                </div>

                <div className="flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button variant="outline" className="border-slate-300">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={mutationAdd.isPending || mutationUpdate.isPending}
                    className="bg-blue-600 hover:bg-blue-700 min-w-[100px]"
                  >
                    {mutationAdd.isPending || mutationUpdate.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {mode === "edit" ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>{mode === "edit" ? "Update" : "Add Admin"}</>
                    )}
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

export default AdminForm;
