import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export const useProcessCheckout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (checkoutData) => {
            const response = await api.post("/checkout/rent-exchange", checkoutData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rent_exchange_items"] });
            queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
        }
    });
};
