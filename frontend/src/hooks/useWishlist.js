import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

// Returns the list of wishlisted productIds (as strings) for the logged in user
export const useWishlistIds = () => {
    const token = localStorage.getItem("access_token");
    return useQuery({
        queryKey: ["wishlist"],
        enabled: Boolean(token),
        queryFn: async () => {
            const response = await api.get("/wishlist");
            return (response.data.productIds ?? []).map(String);
        },
    });
};

// Toggles a product in the wishlist (adds if missing, removes if present)
export const useToggleWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (productId) => {
            const response = await api.post(`/wishlist/${productId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        },
    });
};
