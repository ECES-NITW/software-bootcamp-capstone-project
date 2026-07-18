import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export const useConversations = () => {
    return useQuery({
        queryKey: ["chat_conversations"],
        queryFn: async () => {
            const response = await api.get("/chat/conversations");
            return response.data;
        },
        refetchInterval: 3000,
    });
};

export const useMessages = (conversationId) => {
    return useQuery({
        queryKey: ["chat_messages", conversationId],
        queryFn: async () => {
            const response = await api.get(`/chat/messages?conversationId=${conversationId}`);
            return response.data;
        },
        enabled: Boolean(conversationId),
        refetchInterval: 1500,
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ conversationId, text, contactName }) => {
            const response = await api.post("/chat/messages", { conversationId, text, contactName });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
            if (variables.conversationId) {
                queryClient.invalidateQueries({ queryKey: ["chat_messages", variables.conversationId] });
            }
        }
    });
};
