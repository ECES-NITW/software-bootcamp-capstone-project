import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export const useProducts = (filters = {}) => {
    const { category, type, search, sort } = filters;
    return useQuery({
        queryKey: ["products", search, category, type, sort],
        queryFn: async () => {
            const response = await api.get("/products");
            let data = response.data.products ?? [];

            if (search) {
                const q = search.toLowerCase();
                data = data.filter(
                    (p) =>
                        p.title?.toLowerCase().includes(q) ||
                        p.description?.toLowerCase().includes(q),
                );
            }
            if (type && type !== "all") {
                data = data.filter((p) => p.type === type);
            } else {
                data = data.filter((p) => p.type !== "looking-for");
            }
            if (category && category !== "All") {
                data = data.filter((p) => p.category === category);
            }
            if (sort === "price-low") {
                data = [...data].sort((a, b) => (a.price || 0) - (b.price || 0));
            } else if (sort === "price-high") {
                data = [...data].sort((a, b) => (b.price || 0) - (a.price || 0));
            } else {
                data = [...data].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                );
            }
            return data;
        },
    });
};

export const useProduct = (productId) => {
    return useQuery({
        queryKey: ["product", productId],
        queryFn: async () => {
            const response = await api.get(`/products/${productId}`);
            return response.data.product;
        },
        enabled: Boolean(productId),
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData) => {
            const response = await api.post("/products", formData);
            return response.data.product;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }) => {
            const response = await api.put(`/products/${id}`, formData);
            return response.data.product;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
        },
    });
};

export const useUserProducts = (sellerId) => {
    return useQuery({
        queryKey: ["products", "user", sellerId],
        enabled: Boolean(sellerId),
        queryFn: async () => {
            const response = await api.get("/products", { params: { seller: sellerId } });
            return response.data.products ?? [];
        }
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/products/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
};
