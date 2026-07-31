import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

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

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const response = await api.put("/auth/profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data.user;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export default useUser;
