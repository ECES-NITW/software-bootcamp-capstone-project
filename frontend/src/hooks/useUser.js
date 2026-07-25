import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// This hook calls /auth/profile - an authorized route (the access token is
// attached automatically by the api interceptor) that returns the currently
// logged-in user as { user_id, userName, email, profilePic }.
// Used by ProtectedRoute and the Navbar to gate routes after authorization.
const useUser = () => {
    const token = localStorage.getItem("access_token");
    return useQuery({
        queryKey: ["user"],
        enabled: Boolean(token),
        queryFn: async () => {
            const response = await api.get("/auth/profile");
            return response.data.user;
        },
        retry: false,
    });
};

export default useUser;
