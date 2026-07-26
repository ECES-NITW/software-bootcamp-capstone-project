import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

// Product list. Fetches /products and applies light client-side
// search/category/sort. NOTE: the `type` (rent/exchange) filter and the "rating"
// sort have no Product-model equivalent yet, so they are no-ops (placeholder UI).
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

// Single product by id. Returns the product document (seller populated).
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

// Create a product. Expects multipart FormData (images + fields).
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

// Update a product. Expects { id, formData } (multipart FormData).
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
