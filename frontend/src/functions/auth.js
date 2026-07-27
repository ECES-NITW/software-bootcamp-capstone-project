import { queryClient } from "../main";
import { socket } from "../App";

export const logout = () => {
    localStorage.removeItem("access_token");
    queryClient.clear();
    socket.disconnect();
};
