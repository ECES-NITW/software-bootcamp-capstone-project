import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// This hook calls /auth/me - a route that checks if the user is authorized
// (the access token is attached automatically by the api interceptor) and
// returns the currently logged-in user.
//
// NOTE: the backend /auth/me route hasn't been implemented yet, so this will
// not return anything real until it is. Once it's ready, use this hook inside
// RootLayout (or a dedicated ProtectedRoute) to gate routes(redirect) after authorization.
const useUser = () => {
    const token = localStorage.getItem("access_token");
    return useQuery({
        queryKey: ["user"],
        enabled: Boolean(token),
        queryFn: async () => {
            const response = await api.get("/auth/me");
            return response.data;
        },
        retry: false,
    });
};

export default useUser;
