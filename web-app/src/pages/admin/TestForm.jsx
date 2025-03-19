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
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useAddTest, useGetTestById, useUpdateTest } from "@/services/test.service";
import { Loader2, PlusIcon, TestTube, Beaker } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const testSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

function TestForm({ mode = "add", testId = null, trigger, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch test data if in edit mode
  const { data: test, isLoading } = useGetTestById(testId, {
    enabled: mode === "edit" && Boolean(testId) && (mode === "edit" ? open : isOpen),
  });

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
    formState: { errors, isDirty },
  } = form;

  const mutationAdd = useAddTest();
  const mutationUpdate = useUpdateTest();

  const handleReset = () => {
    mode === "edit"
      ? form.reset(test)
      : form.reset({
          name: "",
        });
  };

  // Handle form submission
  const onSubmit = values => {
    const formData = form.getValues();

    if (mode === "edit" && testId) {
      mutationUpdate.mutate(
        { id: testId, data: formData },
        {
          onSuccess: data => {
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
      mutationAdd.mutate(formData, {
        onSuccess: data => {
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
            <Button variant="default" className="bg-cyan-600 hover:bg-cyan-700">
              <PlusIcon className="mr-1 h-4 w-4" />
              Add Test
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold text-cyan-700">
            <TestTube className="mr-2 h-5 w-5" />
            {mode === "edit" ? "Edit Medical Test" : "Add New Medical Test"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the test details below."
              : "Add a new medical test to the system."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && mode === "edit" ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
            <span className="ml-3 text-slate-600">Loading test data...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Test Icon */}
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-cyan-100 flex items-center justify-center">
                        <Beaker className="h-8 w-8 text-cyan-600" />
                      </div>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="name-field"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Test Name
                      </label>
                      <Input
                        id="name-field"
                        {...register("name")}
                        placeholder="Enter test name"
                        className={`${errors.name ? "border-red-300 focus-visible:ring-red-400" : ""}`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                          {errors.name.message}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Enter a clear, descriptive name for the medical test.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
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
                    disabled={mutationAdd.isPending || mutationUpdate.isPending || !isDirty}
                    className="bg-cyan-600 hover:bg-cyan-700 min-w-[100px]"
                  >
                    {mutationAdd.isPending || mutationUpdate.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {mode === "edit" ? "Updating..." : "Adding..."}
                      </>
                    ) : (
                      <>{mode === "edit" ? "Update" : "Add Test"}</>
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

export default TestForm;
