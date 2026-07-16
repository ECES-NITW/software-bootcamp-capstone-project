import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

// Any component can call this to get data returned plus loading/error state.
// React Query handles caching, request de-duping, and background refetching for us.

//now you can use the data and loading states anywhere in your app
const useExamples = (sort = "recent") => {
    return useQuery({
        queryKey: ["examples", sort],
        queryFn: async () => {
            const response = await api.get("/examples", { params: { sort } });
            // Whatever we return here becomes `data` in the component.
            return response.data;
        },
    });
    // The returned object has: data, isLoading, isError, error, refetch, and more.
};

//If you ever want to get data from another backend route ,
//  just use another hook similar to this,
// This makes it very easy to add new routes and use them anywhere
//You can learn more about react query from youtube or gpt or ask me

export default useExamples;
