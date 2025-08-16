import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useGetExplanations = () => {
  return useMutation({
    mutationFn: async file => {
      const formData = new FormData();
      formData.append("file", file);

      return axios.post("http://13.250.115.70:5000/api/xai-predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  });
};
