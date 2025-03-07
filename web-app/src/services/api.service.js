import axios from "axios";

const createAxiosInstance = baseURL => {
  const instance = axios.create({
    baseURL,
  });

  return instance;
};

const apiURL = import.meta.env.VITE_API_URI
  ? `${import.meta.env.VITE_API_URI}`
  : "http://127.0.0.1:4000/api/";

const api = createAxiosInstance(apiURL);

export { api };
