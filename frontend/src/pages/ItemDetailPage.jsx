import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRentExchangeDetail } from '../hooks/useRentExchange';
import { useItemComments, useAddComment } from '../hooks/useComments';
import Chat from '../components/Chat';
import useUser from '../hooks/useUser';

function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const { data: user } = useUser();
  const isLoggedIn = Boolean(user);

  const { data: item, isLoading, isError } = useRentExchangeDetail(id);
  const { data: comments, isLoading: isCommentsLoading } = useItemComments(id);
  
  const addCommentMutation = useAddComment(id);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addCommentMutation.mutate({ text: commentText }, {
      onSuccess: () => {
        setCommentText("");
      }
    });
  };

  const handlePostReply = (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    addCommentMutation.mutate({ text: replyText, replyToId: commentId }, {
      onSuccess: () => {
        setReplyText("");
        setActiveReplyId(null);
      }
    });
  };

  const handleStartNegotiation = () => {
    if (!item) return;
    // Open the inline chat panel for this product. The conversation is
    // created/loaded by <Chat> via useProductConversation.
    setShowChat(true);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <div className="statusIndicator">
          <span className="statusDot statusDot-active"></span>
          <span>Loading item details...</span>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="glassCard" style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed #ef4444' }}>
        <p style={{ color: '#fca5a5' }}>Item not found or failed to retrieve details.</p>
        <button className="btn" style={{ marginTop: '16px' }} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
      
      <div className="detailGrid">
        
        <div>
          <img src={item.image} alt={item.title} className="detailImage" />
        </div>

        <div className="detailInfo">
          
          <div>
            <div className="detailTags" style={{ display: 'flex', gap: '8px' }}>
              <span className={`cardBadge ${item.type === 'rent' ? 'badge-rent' : 'badge-swap'}`} style={{ position: 'static' }}>
                {item.type}
              </span>
              <span className="statusIndicator">{item.category}</span>
            </div>
            
            <h1 style={{ fontFamily: 'Lora, serif', fontSize: '2.2rem', fontWeight: 700, marginTop: '16px', lineHeight: '1.2' }}>
              {item.title}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <div>Seller: <strong style={{ color: 'var(--text-main)' }}>{item.seller}</strong></div>
            <div>Rating: <span style={{ color: '#b58d63' }}>★ {item.rating}</span></div>
          </div>

          <div style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', fontFamily: 'Lora, serif' }}>Description</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.description}</p>
          </div>

          <div className="detailPriceSection">
            {item.type === 'rent' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>RENTAL RATE:</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    ${item.price}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/week</span>
                  </div>
                </div>
                {item.deposit && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '20px', color: 'var(--text-muted)' }}>
                    <span>Security Deposit (Refundable):</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>${item.deposit}</span>
                  </div>
                )}
                {isLoggedIn ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/checkout/${item.id}`)}>
                      🔒 Secure Rental Escrow
                    </button>
                    <button className="btn" style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border-color)', color: 'var(--primary)' }} onClick={handleStartNegotiation}>
                      💬 Chat
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#fdf5e6', border: '1.5px dashed var(--secondary)', padding: '16px', borderRadius: '12px', color: 'var(--accent-swap)', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                    ⚠️ Authorization required. Please log in or register to rent or chat.
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>TRADE PREFERENCES:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-swap)' }}>
                    🔁 Swap for: {item.preferences}
                  </div>
                </div>
                {isLoggedIn ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ flex: 1, background: 'var(--secondary)' }} onClick={handleStartNegotiation}>
                      💬 Initiate Swap Negotiation
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#fdf5e6', border: '1.5px dashed var(--secondary)', padding: '16px', borderRadius: '12px', color: 'var(--accent-swap)', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                    ⚠️ Authorization required. Please log in or register to negotiate.
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>

      {showChat && item && (
        <section className="chatSection" style={{ marginTop: '32px' }}>
          <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>
            💬 Chat with {item.seller}
          </h2>
          <div className="chatContainer" style={{ minHeight: '360px' }}>
            <Chat productId={id} sellerId={item.sellerId} />
          </div>
        </section>
      )}

      <section className="commentsSection">
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.4rem', fontWeight: 700, marginBottom: '20px' }}>
          ❓ Discussion & Questions ({comments?.length || 0})
        </h2>

        {isLoggedIn ? (
          <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <input 
              type="text" 
              className="formInput" 
              placeholder="Ask the seller a question..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={addCommentMutation.isPending}>
              Ask Question
            </button>
          </form>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '32px' }}>
            Please log in or register to ask questions.
          </p>
        )}

        {isCommentsLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading comments...</p>
        ) : (
          <div className="commentsList">
            {comments?.map((comment) => (
              <div key={comment.id} className="commentCard">
                <div className="commentHeader">
                  <div className="navAvatar" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                    {comment.user.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="commentUser">{comment.user}</span>
                  <span className="commentTime">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="commentBody">{comment.text}</p>
                
                {isLoggedIn && (
                  <button 
                    className="commentReplyBtn" 
                    onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                  >
                    Reply
                  </button>
                )}

                {activeReplyId === comment.id && (
                  <form onSubmit={(e) => handlePostReply(e, comment.id)} style={{ display: 'flex', gap: '8px', marginTop: '8px', marginLeft: '16px' }}>
                    <input 
                      type="text" 
                      className="formInput" 
                      placeholder="Write a reply..." 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                      Reply
                    </button>
                  </form>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="commentReplies">
                    {comment.replies.map(reply => (
                      <div key={reply.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div className="commentHeader">
                          <div className="navAvatar" style={{ width: '20px', height: '20px', fontSize: '0.65rem' }}>
                            {reply.user.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="commentUser" style={{ fontSize: '0.85rem' }}>{reply.user}</span>
                          <span className="commentTime">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="commentBody" style={{ fontSize: '0.88rem' }}>{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default ItemDetailPage;
