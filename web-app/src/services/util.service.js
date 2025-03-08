import { useMutation } from "@tanstack/react-query";
import { api } from "./api.service";

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async file => {
      const formData = new FormData();
      formData.append("image", file);

      return api.post("/util/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  });
};

export const useDeleteImage = () => {
  return useMutation({
    mutationFn: async ({ key }) => api.post("/util/delete-image", { key }),
  });
};
