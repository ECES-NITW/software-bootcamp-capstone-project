import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export const useItemComments = (itemId) => {
    return useQuery({
        queryKey: ["item_comments", itemId],
        queryFn: async () => {
            const response = await api.get(`/items/${itemId}/comments`);
            return response.data;
        },
        enabled: Boolean(itemId),
    });
};

export const useAddComment = (itemId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ text, replyToId }) => {
            const response = await api.post(`/items/${itemId}/comments`, { text, replyToId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["item_comments", itemId] });
        }
    });
};
