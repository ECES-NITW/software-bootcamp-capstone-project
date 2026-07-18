import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [msgInput, setMsgInput] = useState("");
    useEffect(() => {
        const handleResponse = (data) => {
            const role = data.sender===socket.id ? "user" : "other"
            setMessages((prev) => [...prev, { message: data.message , sender:role}]);
        };
        socket.on("response", handleResponse);
        return () => {
            socket.off("response", handleResponse);
        };
    }, []);

    const sendMessage = (e) => {
        e.preventDefault();
        socket.emit("message", msgInput);
        setMsgInput("");
    };

    return (
        <div>
            <div>{messages.map((msg) => {
              if (msg.sender=="user"){
                return(<div>{"user:" + msg.message}</div>)
              }else{
                return(<div>{"other:" + msg.message}</div>)
              }
            })}</div>
            <form onSubmit={(e) => sendMessage(e)}>
                <input
                    value={msgInput}
                    onChange={(e) => {
                        setMsgInput(e.target.value);
                    }}
                    required
                />
                <button type="submit">Send Message</button>
            </form>
        </div>
    );
};

export default Chat;
