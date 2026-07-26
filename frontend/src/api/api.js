import axios from "axios";
import { logout } from "../functions/auth";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,//Importing Backend URL from .env file
    withCredentials: true,
});

//Attaching the access token for all the api calls(for authorisation)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers.Accept = "application/json";
    return config;
});


api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            error.response?.data?.message === "Session expired, please log in again"
        ) {
            logout();
        }
        return Promise.reject(error);
    },
);

export default api

