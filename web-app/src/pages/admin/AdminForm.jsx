import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAddAdmin, useGetAdminById, useUpdateAdmin } from "@/services/admin.service";
import { useDeleteImage, useUploadImage } from "@/services/util.service";
import { Loader2, Mail, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PushSpinner } from "react-spinners-kit";

export const adminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  image: z.object({
    Location: z
      .string()
      .min(10, { message: "Please upload an image" }) // Image URL is required
      .url({ message: "Invalid image URL" }), // Check if it's a valid URL
    Key: z.string().optional(),
  }),
});

function AdminForm({ mode = "add", adminId = null, trigger, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false); // Track the dialog state

  // Fetch admin data if in edit mode
  const { data: admin, isLoading } = useGetAdminById(adminId, {
    enabled: mode === "edit" && Boolean(adminId) && (mode === "edit" ? open : isOpen),
  });
  console.log("admin", admin);

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
    formState: { errors },
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

  // Handle form submission
  const onSubmit = values => {
    // Get complete form data
    const formData = form.getValues();

    // Choose operation based on mode
    if (mode === "edit" && adminId) {
      // Update existing admin
      mutationUpdate.mutate(
        { id: adminId, data: formData },
        {
          onSuccess: data => {
            console.log("Admin updated successfully:", data);
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
      // Add new admin
      mutationAdd.mutate(formData, {
        onSuccess: data => {
          console.log("Admin added successfully:", data);
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
    // Set random type, name, specialist, phone, email, and address
    const formValues = {
      name: `${["Smith", "Jones", "Taylor", "Brown", "Williams"][Math.floor(Math.random() * 5)]}`,
      email: `test${Math.floor(Math.random() * 10000)}@example.com`,
      image: { Location: "", Key: "" },
    };

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
            <Button variant="primary">
              <PlusIcon />
              Add Admin
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit admin" : "Add new admin"}</DialogTitle>
        </DialogHeader>

        {isLoading && mode === "edit" ? (
          <div className="flex items-center justify-center h-32">
            <PushSpinner size={30} color="#3B82F6" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6 border rounded-lg w-[450px]"
            >
              <div className="space-y-4">
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
                      <span className="text-sm text-destructive">
                        {errors.image.Location.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`name-field`}
                      className="block text-sm font-medium text-primary"
                    >
                      Name
                    </label>
                    <Input
                      id="name-field"
                      {...register("name")}
                      className="block w-full p-2 border rounded-md"
                    />
                    {errors.name && (
                      <span className="text-sm text-destructive">{errors.name.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email-field" className="block text-sm font-medium text-primary">
                      Email Address
                    </label>
                    <Input
                      id="email-field"
                      {...register("email")}
                      className="block w-full p-2 border rounded-md"
                      readOnly={mode === "edit"}
                    />
                    {errors.email && (
                      <span className="text-sm text-destructive">{errors.email.message}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {mode === "add" && (
                      <Button type="button" variant="outline" onClick={handleDemo}>
                        Demo
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        handleReset();
                      }}
                    >
                      Reset
                    </Button>
                  </div>

                  <div className="flex justify-end gap-4">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={mutationAdd.isPending || mutationUpdate.isPending}
                      className="min-w-[120px]"
                    >
                      {mutationAdd.isPending || mutationUpdate.isPending ? (
                        <Loader2 className="animate-spin size-4" />
                      ) : mode === "edit" ? (
                        "Update Admin"
                      ) : (
                        "Add Admin"
                      )}
                    </Button>
                  </div>
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
