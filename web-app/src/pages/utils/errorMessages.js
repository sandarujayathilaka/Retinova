export const getErrorMessage = (error) => {
    const errorData = error.response?.data || {};
    return (
      errorData.message ||
      (errorData.success === false
        ? errorData.message === "Doctor ID and next visit date are required"
          ? "Doctor ID and revisit date are required"
          : errorData.message.includes("Patient with ID")
          ? "Patient not found"
          : "Error updating revisit"
        : "An unexpected error occurred")
    );
  };