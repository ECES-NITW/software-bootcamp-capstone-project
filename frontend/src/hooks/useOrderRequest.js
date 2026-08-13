import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export const useCreateOrderRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ productId, orderType }) => {
            try {
                const response = await api.post("/orders", {
                    productId,
                    orderType,
                });
                return { order: response.data.order };
            } catch (err) {
                if (err.response?.status === 409) {
                    return { order: err.response.data.order, duplicate: true };
                }
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user_orders"] });
        },
    });
};

export const REQUEST_LABELS = {
    buy: "Purchase request",
    rent: "Rental request",
    exchange: "Swap request",
};

export const REQUEST_BUTTON_LABELS = {
    buy: "Request to Buy",
    rent: "Request to Rent",
    exchange: "Request Swap",
};

