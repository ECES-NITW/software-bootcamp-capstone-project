import axios from "axios";

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

//you can add a response interceptor as well so you can log the user out
//whenever the backend returns unauthorized error
// These work for all the fetching/query calls you'll be using
//Just import api wherever you want to use it

export default api

