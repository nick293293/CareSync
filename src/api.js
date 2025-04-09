import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Backend base URL sdsds 
});

export default api;
