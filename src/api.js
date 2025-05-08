import axios from "axios";

const api = axios.create({
  baseURL: "https://caresync-psh6.onrender.com/api", // Backend base URL sdsds 
});

export default api;
