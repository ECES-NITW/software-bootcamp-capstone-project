import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

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

// Agreed (accepted offer) price for the logged in user on a product, or null
export const useAgreedPrice = (productId) => {
    const token = localStorage.getItem("access_token");
    return useQuery({
        queryKey: ["agreed_price", productId],
        enabled: Boolean(token && productId),
        queryFn: async () => {
            const response = await api.get(`/chat/agreed-price/${productId}`);
            return response.data.agreedPrice;
        },
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
    });
};

