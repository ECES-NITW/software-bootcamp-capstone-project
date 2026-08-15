import { queryClient } from "../main";
import socket from "../api/socket";

export const logout = () => {
  localStorage.removeItem("access_token");
  queryClient.clear();

  socket.disconnect();
};
