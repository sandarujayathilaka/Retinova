import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAddTest, useGetTestById, useUpdateTest } from "@/services/test.service";
import { Loader2, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PushSpinner } from "react-spinners-kit";

export const testSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

function TestForm({ mode = "add", testId = null, trigger, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false); // Track the dialog state

  // Fetch test data if in edit mode
  const { data: test, isLoading } = useGetTestById(testId, {
    enabled: mode === "edit" && Boolean(testId) && (mode === "edit" ? open : isOpen),
  });
  console.log("test", test);

  // Create a form instance
  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: "",
    },
  });

  const {
    register,
    formState: { errors },
  } = form;

  const mutationAdd = useAddTest();
  const mutationUpdate = useUpdateTest();

  const handleReset = () => {
    mode === "edit"
      ? form.reset(test)
      : form.reset({
          name: "",
          email: "",
          image: { Location: "", Key: "" },
        });
  };

  // Handle form submission
  const onSubmit = values => {
    // Get complete form data
    const formData = form.getValues();

    // Choose operation based on mode
    if (mode === "edit" && testId) {
      // Update existing test
      mutationUpdate.mutate(
        { id: testId, data: formData },
        {
          onSuccess: data => {
            console.log("Test updated successfully:", data);
            handleReset();
            toast.success("Test updated successfully!");
            onOpenChange(false);
          },
          onError: error => {
            console.error(error);
            toast.error("Failed to update test. Please try again.");
          },
        },
      );
    } else {
      // Add new test
      mutationAdd.mutate(formData, {
        onSuccess: data => {
          console.log("Test added successfully:", data);
          handleReset();
          toast.success("Test added successfully!");
          setIsOpen(false);
        },
        onError: error => {
          console.error(error);
          toast.error(
            error?.response?.data?.error?.message ??
              error?.response?.data?.error ??
              "Failed to add test. Please try again.",
          );
        },
      });
    }
  };

  // Fill the form with data when editing
  useEffect(() => {
    if (mode === "edit" && test && !isLoading) {
      form.reset(test);
    }
  }, [test, isLoading, form, mode, open]);

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
              Add Test
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit test" : "Add new test"}</DialogTitle>
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
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
                        "Update Test"
                      ) : (
                        "Add Test"
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

export default TestForm;
