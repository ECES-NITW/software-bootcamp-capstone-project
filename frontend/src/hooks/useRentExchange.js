import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export const useRentExchangeItems = (filters = {}) => {
    const { category, type, search, sort } = filters;
    return useQuery({
        queryKey: ["rent_exchange_items", category, type, search, sort],
        queryFn: async () => {
            const response = await api.get("/items/rent-exchange");
            let data = response.data;

            if (search) {
                const searchLower = search.toLowerCase();
                data = data.filter(item => 
                    item.title.toLowerCase().includes(searchLower) ||
                    item.description.toLowerCase().includes(searchLower)
                );
            }

            if (category && category !== "All") {
                data = data.filter(item => item.category === category);
            }

            if (type && type !== "all") {
                data = data.filter(item => item.type === type);
            }

            if (sort === "price-low") {
                data = data.sort((a, b) => (a.price || 0) - (b.price || 0));
            } else if (sort === "price-high") {
                data = data.sort((a, b) => (b.price || 0) - (a.price || 0));
            } else if (sort === "rating") {
                data = data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            } else {
                data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            }

            return data;
        }
    });
};

export const useRentExchangeDetail = (id) => {
    return useQuery({
        queryKey: ["rent_exchange_item", id],
        queryFn: async () => {
            const response = await api.get(`/items/${id}`);
            return response.data;
        },
        enabled: Boolean(id),
    });
};

export const useCreateRentExchangeItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newItemData) => {
            const response = await api.post("/items/rent-exchange", newItemData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rent_exchange_items"] });
        }
    });
};
