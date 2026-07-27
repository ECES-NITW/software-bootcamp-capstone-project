import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// Used by ProtectedRoute and the Navbar to gate routes after authorization.
const useUser = () => {
    const token = localStorage.getItem("access_token");
    return useQuery({
        queryKey: ["user"],
        enabled: Boolean(token),
        queryFn: async () => {
            const response = await api.get("/auth/me");
            return response.data.user;
        },
        retry: false,
    });
};

//Public Route for getting contactInfo
export const useProfile = (userId) => {
    return useQuery({
        queryKey: ["profile", userId],
        enabled: Boolean(userId),
        queryFn: async () => {
            const response = await api.get(`/auth/profile/${userId}`);
            return response.data.user;
        },
    });
};

export default useUser;
