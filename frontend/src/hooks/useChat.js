import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

// Fetches (or lazily creates) the conversation for a given product and returns
// its metadata (conversationId, lastMessage, ...). Only productId is sent - the
// seller is derived from the product server-side.
export const useProductConversation = (productId) => {
    return useQuery({
        queryKey: ["chat_conversation", productId],
        queryFn: async () => {
            const response = await api.get(`/chat/conversation/${productId}`);
            return response.data;
        },
        enabled: Boolean(productId),
    });
};

export const useConversations = () => {
    return useQuery({
        queryKey: ["chat_conversations"],
        queryFn: async () => {
            const response = await api.get("/chat/conversations");
            return response.data;
        },
    });
};

// Messages for a conversation. Only runs once a conversationId exists. No
// polling - live updates arrive over the socket and are written into this same
// cache; the query just provides the DB-authoritative baseline on load/refetch.
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
