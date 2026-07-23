import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

// Fetches (or creates) the conversation for a given product, along with its
// messages. productId is sent as a path parameter, sellerId as a query parameter.
export const useProductConversation = (productId, sellerId) => {
    return useQuery({
        queryKey: ["chat_conversation", productId, sellerId],
        queryFn: async () => {
            const response = await api.get(
                `/chat/conversation/${productId}?sellerId=${sellerId}`
            );
            return response.data;
        },
        enabled: Boolean(productId && sellerId),
    });
};

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
            const response = await api.get(
                `/chat/messages?conversationId=${conversationId}`,
            );
            return response.data;
        },
        enabled: Boolean(conversationId),   
        refetchInterval: 1500,
    });
};

export const useSendMessages = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, convoId, sender, message }) => {
            const response = await api.post("/chat/messages", {
                id,
                convoId,
                sender,
                message,
            });
            return response.data;
        },

        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
            if (variables.convoId) {
                queryClient.invalidateQueries({
                    queryKey: ["chat_messages", variables.convoId],
                });
            }
        },
    });
};
