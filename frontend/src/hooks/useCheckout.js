import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export const useProcessCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkoutData) => {
      const response = await api.post("/checkout/rent-exchange", checkoutData);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rent_exchange_items"],
      });

      queryClient.invalidateQueries({
        queryKey: ["chat_conversations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user_orders"],
      });
    },
  });
};

export const useUserOrders = () => {
<<<<<<< HEAD
  return useQuery({
    queryKey: ["user_orders"],
    queryFn: async () => {
      const response = await api.get("/orders/myorders");

      return response.data.orders ?? [];
    },
  });
=======
    return useQuery({
        queryKey: ["user_orders"],
        queryFn: async () => {
            const response = await api.get("/orders/myorders");
            return response.data.orders ?? [];
        }
    });
};

export const useReceivedOrders = () => {
    return useQuery({
        queryKey: ["received_orders"],
        queryFn: async () => {
            const response = await api.get("/orders/receivedorders");
            return response.data.orders ?? [];
        }
    });
>>>>>>> 62ee51df517e1f440d32111ff5194eb04c7bfd95
};
