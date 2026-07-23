import { useEffect, useState } from "react";
import { useMessages } from "../hooks/useChat";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../App";
import useUser from "../hooks/useUser";

const Chat = ({ productId }) => {
    const queryClient = useQueryClient();
    const { data: user } = useUser();
    const {
        data: messages,
        isLoading,
        isFetching,
        isError,
    } = useMessages(conversationId);
    const [msgInput, setMsgInput] = useState("");
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
      //Joining the room
        socket.emit("join_room", productId);
        
        const handleConnect = () => {
            console.log("Connected:", socket.id);
            setIsConnected(true);
            queryClient.invalidateQueries({
                queryKey: ["chat_messages", productId],
            });
        };
        
        const handleResponse = (data) => {
            queryClient.setQueryData(
                ["chat_messages", conversationId],
                (prev = []) => [...prev, data],
            );
        };
        //Listening to Connections (reserved keyword) - Used for network reconnections
        socket.on("connect", handleConnect);
        //Listening to responses - for new messages
        socket.on("response", handleResponse);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("response", handleResponse);
        };
    }, [conversationId, queryClient]);

    const sendMessage = (e) => {
        e.preventDefault();
        const newMessage = {
            msgId:crypto.randomUUID(),
            conversationId,
            message: msgInput,
            sender: user?.user_id,
        };
        socket.emit("message", newMessage);
        queryClient.setQueryData(
            ["chat_messages", conversationId],
            (prev = []) => [...prev, newMessage],
        );
        setMsgInput("");
    };

    let status = "Connected";
    if (isError) status = "Error";
    else if (isLoading) status = "Loading...";
    else if (isFetching) status = "Fetching...";
    else if (!isConnected) status = "Connecting...";

    return (
        <div>
            <div>
                {messages?.map((msg, i) => {
                    const isMe = msg.sender === user?.user_id;
                    return (
                        <div key={msg.id ?? i}>
                            {(isMe ? "user:" : "other:") + msg.message}
                        </div>
                    );
                })}
            </div>
            <form onSubmit={sendMessage}>
                <input
                    value={msgInput}
                    onChange={(e) => {
                        setMsgInput(e.target.value);
                    }}
                    required
                />
                <button type="submit">Send Message</button>
            </form>
            <p>{status}</p>
        </div>
    );
};

export default Chat;
