import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../App";
import useUser from "../hooks/useUser";
import { useMessages } from "../hooks/useChat";

const Chat = ({ conversationId }) => {
    const queryClient = useQueryClient();
    const { data: user } = useUser();
    const { data: messages = [], isLoading } = useMessages(conversationId);

    const [msgInput, setMsgInput] = useState("");
    const [isConnected, setIsConnected] = useState(socket.connected);
    const bottomRef = useRef(null);

    const addMessage = (msg) => {
        queryClient.setQueryData(
            ["chat_messages", conversationId],
            (prev = []) => [...prev, msg],
        );
    };

    useEffect(() => {
        if (!conversationId) return;
        if (!socket.connected) socket.connect();

        const joinRoom = () => socket.emit("join_room", conversationId);
        joinRoom();

        const handleConnect = () => {
            setIsConnected(true);
            joinRoom();
        };
        const handleDisconnect = () => setIsConnected(false);
        const handleResponse = (data) => {
            if (data.conversationId && data.conversationId !== conversationId)
                return;
            addMessage(data);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("response", handleResponse);

        return () => {
            socket.emit("leave_room", conversationId);
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("response", handleResponse);
        };
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!msgInput.trim() || !conversationId) return;

        const newMessage = {
            msgId: crypto.randomUUID(),
            conversationId,
            message: msgInput,
            sender: user?.user_id,
        };
        socket.emit("message", newMessage);
        addMessage(newMessage);
        setMsgInput("");
    };

    return (
        <>
            <div className="chatMessages">
                {isLoading ? (
                    <p style={{ color: "var(--text-muted)" }}>
                        Loading message history...
                    </p>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.sender === user?.user_id;
                        return (
                            <div
                                key={msg.msgId ?? msg.id ?? i}
                                className={`chatBubble ${isMe ? "bubble-sent" : "bubble-received"}`}
                            >
                                {msg.message}
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <form className="chatInputArea" onSubmit={sendMessage}>
                <input
                    className="formInput"
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1 }}
                    required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: "0 20px" }}>
                    Send
                </button>
            </form>

            {!isConnected && <p className="chatStatus">Connecting...</p>}
        </>
    );
};

export default Chat;
