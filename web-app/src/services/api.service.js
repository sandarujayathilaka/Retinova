import axios from "axios";

const createAxiosInstance = baseURL => {
  const instance = axios.create({
    baseURL,
  });

  return instance;
};

const apiURL = import.meta.env.VITE_API_URI
  ? `${import.meta.env.VITE_API_URI}`
  : "http://localhost:4000/api/";
// "http://127.0.0.1:5000/";
const api = createAxiosInstance(apiURL);

export { api };
