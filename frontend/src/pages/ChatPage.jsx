import { useState, useEffect, useRef } from 'react';
import { useConversations, useMessages, useSendMessages } from '../hooks/useChat';
import useUser from '../hooks/useUser';

function ChatPage() {
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const { data: conversations, isLoading: isConvsLoading } = useConversations();
  const { data: messages, isLoading: isMsgsLoading } = useMessages(selectedConvId);
  const sendMessageMutation = useSendMessages();
  const { data: user } = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConvId) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvId) return;

    sendMessageMutation.mutate({
      id: crypto.randomUUID(),
      convoId: selectedConvId,
      sender: user?._id,
      message: inputText,
    });
    setInputText("");
  };

  const activeConv = conversations?.find(c => c.id === selectedConvId);
  
  const showTypingIndicator = messages && messages.length > 0 && messages[messages.length - 1].sender === "me";

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2rem', fontWeight: 700 }}>
          💬 Messages Hub
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Negotiate rentals, coordinate swaps, and complete escrow transfers.
        </p>
      </div>

      <div className="chatContainer">
        
        <div className="chatSidebar">
          <div className="chatListHeader">Conversations</div>
          
          {isConvsLoading ? (
            <p style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading conversations...</p>
          ) : conversations?.length === 0 ? (
            <p style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>No conversations started yet.</p>
          ) : (
            <div className="chatList">
              {conversations?.map((conv) => (
                <div 
                  key={conv.id} 
                  className={`chatItem ${selectedConvId === conv.id ? 'active' : ''}`}
                  onClick={() => setSelectedConvId(conv.id)}
                >
                  <div className="navAvatar" style={{ flexShrink: 0 }}>
                    {conv.contactName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="chatItemInfo">
                    <div className="chatItemName">{conv.contactName}</div>
                    <div className="chatItemMessage">{conv.lastMessage}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chatMain">
          {selectedConvId && activeConv ? (
            <>
              <div className="chatHeader">
                <div className="navAvatar">
                  {activeConv.contactName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{activeConv.contactName}</h3>
                  <span className="statusIndicator" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>
                    <span className="statusDot statusDot-active" style={{ width: '6px', height: '6px', marginRight: '4px' }}></span>
                    Online
                  </span>
                </div>
              </div>

              <div className="chatMessages">
                {isMsgsLoading ? (
                  <p style={{ color: 'var(--text-muted)' }}>Loading message history...</p>
                ) : (
                  messages?.map((msg, index) => {
                    if (msg.sender === 'System') {
                      return (
                        <div 
                          key={index} 
                          style={{ 
                            alignSelf: 'center', 
                            background: 'rgba(99, 102, 241, 0.05)', 
                            border: '1px solid rgba(99, 102, 241, 0.15)', 
                            color: 'var(--secondary)', 
                            padding: '8px 16px', 
                            borderRadius: '10px', 
                            fontSize: '0.8rem', 
                            textAlign: 'center', 
                            maxWidth: '80%', 
                            margin: '8px 0' 
                          }}
                        >
                          {msg.message ?? msg.text}
                        </div>
                      );
                    }
                    const isMe = msg.sender === user?._id || msg.sender === 'me';
                    return (
                      <div
                        key={msg.id ?? index}
                        className={`chatBubble ${isMe ? 'bubble-sent' : 'bubble-received'}`}
                      >
                        {msg.message ?? msg.text}
                        {msg.status === 'sending' && (
                          <span style={{ fontSize: '0.65rem', opacity: 0.6, marginLeft: '6px' }}>
                            sending…
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
                
                {showTypingIndicator && (
                  <div className="typingIndicator">
                    <span className="typingDot"></span>
                    <span className="typingDot"></span>
                    <span className="typingDot"></span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <form className="chatInputArea" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  className="formInput" 
                  placeholder="Type a message..." 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 20px' }}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '3rem' }}>💬</span>
              <p style={{ color: 'var(--text-muted)' }}>Select a conversation to start messaging</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ChatPage;
