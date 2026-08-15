import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "../api/api";

export const PRODUCTS_PAGE_SIZE = 24;

export const PLACEHOLDER_IMAGE = "/No_Image_Available_image.jpg";

export const listingPrice = (product) =>
  product?.price ?? product?.rentPrice ?? product?.budget ?? 0;

export const useProducts = (filters = {}) => {
  const { category, type, search, sort } = filters;
  return useQuery({
    queryKey: ["products", search, category, type, sort],
    queryFn: async () => {
      const response = await api.get("/products", { params: { sort } });
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
        data = data.filter((p) => p.types?.includes(type));
      } else {
        data = data.filter((p) => !p.types?.includes("looking-for"));
      }
      if (category && category !== "All") {
        data = data.filter((p) => p.category === category);
      }
      return data;
    },
  });
};

export const useInfiniteProducts = (filters = {}) => {
  const { category, type, search, sort } = filters;
  return useInfiniteQuery({
    queryKey: ["products", "infinite", search, category, type, sort],
    initialPageParam: 1,
    placeholderData: (prev) => prev,
    queryFn: async ({ pageParam }) => {
      const params = { sort, page: pageParam, limit: PRODUCTS_PAGE_SIZE };
      if (search) params.search = search;
      if (category && category !== "All") params.category = category;
      params.types =
        type && type !== "all" ? [type] : ["sell", "rent", "exchange"];
      const response = await api.get("/products", { params });
      return response.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
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

export const useUserProducts = () => {
  return useQuery({
    queryKey: ["products", "my"],
    queryFn: async () => {
      const response = await api.get("/products/my");
      return response.data.products ?? [];
    },
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
