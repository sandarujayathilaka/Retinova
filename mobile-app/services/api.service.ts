import axios from "axios";

const createAxiosInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
  });

  return instance;
};

const apiURL = process.env.EXPO_PUBLIC_API_URI
  ? `${process.env.EXPO_PUBLIC_API_URI}`
  : "http://192.168.43.220:4000/api";

const api = createAxiosInstance(apiURL);

export { api };
