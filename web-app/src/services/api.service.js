import axios from "axios";

const createAxiosInstance = baseURL => {
  const instance = axios.create({
    baseURL,
  });

  return instance;
};

const apiURL = import.meta.env.VITE_API_URI
  ? `${import.meta.env.VITE_API_URI}`
  : "http://localhost:5000/";

const api = createAxiosInstance(apiURL);

export { api };
