import axios from "axios";
import { queryClient } from "../main";

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

// On an unauthorized response, clear the token and the cached user so the app
// treats the session as logged out. We do NOT redirect here - ProtectedRoute
// renders its own "login required" state once the user query is gone.
// queryClient is imported lazily-in-use (inside the callback) so the circular
// import with main.jsx resolves at runtime.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("access_token");
            queryClient.removeQueries({ queryKey: ["user"] });
        }
        return Promise.reject(error);
    },
);

export default api

