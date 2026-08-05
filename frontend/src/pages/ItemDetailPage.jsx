import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { useProduct } from "../hooks/useProducts";
import { useItemComments, useAddComment } from "../hooks/useComments";
import useUser, { useProfile } from "../hooks/useUser";
import useMediaQuery from "../hooks/useMediaQuery";

import ProductChatWrapper from "../components/ProductChatWrapper";

const RATING_PLACEHOLDER = 4.5;

function ItemDetailPage() {
  const { id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const isDesktop = useMediaQuery("(min-width:900px)");

  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const { data: user } = useUser();

  const isLoggedIn = Boolean(user);

  const { data: item, isLoading, isError } = useProduct(id);

  const sellerId = item?.seller?._id ?? item?.seller;

  const { data: contactInfo } = useProfile(sellerId);

  const { data: comments, isLoading: isCommentsLoading } = useItemComments(id);

  const addCommentMutation = useAddComment(id);

  const isOwnProduct = Boolean(
    user && sellerId && String(sellerId) === String(user.user_id),
  );

  useEffect(() => {
    if (location.state?.showChat) {
      setShowChat(true);
    }
  }, [location.state]);

  const handlePostComment = (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    addCommentMutation.mutate(
      {
        text: commentText,
      },
      {
        onSuccess: () => {
          setCommentText("");
        },
      },
    );
  };

  const handlePostReply = (e, commentId) => {
    e.preventDefault();

    if (!replyText.trim()) return;

    addCommentMutation.mutate(
      {
        text: replyText,
        replyToId: commentId,
      },
      {
        onSuccess: () => {
          setReplyText("");
          setActiveReplyId(null);
        },
      },
    );
  };

  const handleOpenChat = () => {
    setShowChat(true);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "70px",
        }}
      >
        <div className="statusIndicator">
          <span className="statusDot statusDot-active"></span>
          Loading Item...
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div
        className="glassCard"
        style={{
          padding: "60px",
          textAlign: "center",
        }}
      >
        <h2>Item not found.</h2>

        <button className="btn" onClick={() => navigate("/")}>
          Back Home
        </button>
      </div>
    );
  }

  const image = item.images?.[0]?.url || "";

  const sellerName = contactInfo?.userName || "Seller";

  const chatOpen = showChat && !isOwnProduct;

  const chatPanel = (
    <ProductChatWrapper
      productId={id}
      productInfo={item}
      contactInfo={contactInfo}
      onClose={() => setShowChat(false)}
    />
  );

  return (
    <div
      style={{
        animation: "fadeInUp .4s ease-out",
      }}
    >
      <div className="detailLayout">
        <div className="detailMainCol">
          <div className="detailGrid">
            <div>
              {image ? (
                <img src={image} alt={item.title} className="detailImage" />
              ) : (
                <div className="detailImage detailImagePlaceholder">
                  No Image
                </div>
              )}
            </div>

            <div className="detailInfo">
              <div>
                <div
                  className="detailTags"
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {item.condition && (
                    <span
                      className="cardBadge badge-rent"
                      style={{
                        position: "static",
                      }}
                    >
                      {item.condition}
                    </span>
                  )}

                  <span className="statusIndicator">{item.category}</span>

                  {item.status && (
                    <span className="statusIndicator">{item.status}</span>
                  )}
                </div>

                <h1
                  style={{
                    fontFamily: "Lora, serif",
                    fontSize: "2.2rem",
                    marginTop: "16px",
                    fontWeight: 700,
                  }}
                >
                  {item.title}
                </h1>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  flexWrap: "wrap",
                  color: "var(--text-muted)",
                  fontSize: ".9rem",
                }}
              >
                <div>
                  Seller :
                  <strong
                    style={{
                      color: "var(--text-main)",
                    }}
                  >
                    {" "}
                    {isOwnProduct ? "You" : sellerName}
                  </strong>
                </div>

                <div>
                  Rating :
                  <span
                    style={{
                      color: "#b58d63",
                    }}
                  >
                    {" "}
                    ★ {RATING_PLACEHOLDER}
                  </span>
                </div>

                {item.location && <div>📍 {item.location}</div>}
              </div>

              <div
                style={{
                  borderBottom: "1.5px solid var(--border-color)",
                  paddingBottom: "20px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "10px",
                  }}
                >
                  Description
                </h3>

                <p
                  style={{
                    color: "var(--text-muted)",
                    lineHeight: "1.7",
                  }}
                >
                  {item.description}
                </p>
              </div>
              {item.type === "rent" ? (
                <>
                  <div className="detailPriceSection">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                          fontWeight: 700,
                        }}
                      >
                        RENTAL RATE:
                      </div>

                      <div
                        style={{
                          fontSize: "1.8rem",
                          fontWeight: 800,
                          color: "var(--text-main)",
                        }}
                      >
                        ₹{item.price}
                        <span
                          style={{
                            fontSize: "0.9rem",
                            color: "var(--text-muted)",
                            fontWeight: 500,
                          }}
                        >
                          /week
                        </span>
                      </div>
                    </div>

                    {item.deposit && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.9rem",
                          marginBottom: "20px",
                          color: "var(--text-muted)",
                        }}
                      >
                        <span>Security Deposit:</span>
                        <span
                          style={{
                            color: "var(--text-main)",
                            fontWeight: 700,
                          }}
                        >
                          ₹{item.deposit}
                        </span>
                      </div>
                    )}

                    {isLoggedIn ? (
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => navigate(`/checkout/${item._id}`)}
                        >
                          🔒 Secure Rental
                        </button>

                        {!isOwnProduct && (
                          <button
                            className="btn"
                            style={{
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border-color)",
                              color: "var(--primary)",
                            }}
                            onClick={() => setShowChat(true)}
                          >
                            💬 Chat
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "#fdf5e6",
                          border: "1px dashed var(--secondary)",
                          padding: "16px",
                          borderRadius: "12px",
                          textAlign: "center",
                          color: "var(--accent-swap)",
                          fontWeight: 600,
                        }}
                      >
                        Login to rent this product.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "18px" }}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        fontWeight: 700,
                        marginBottom: "6px",
                      }}
                    >
                      TRADE PREFERENCES
                    </div>

                    <div
                      style={{
                        fontSize: "1.1rem",
                        color: "var(--accent-swap)",
                        fontWeight: 700,
                      }}
                    >
                      🔁 {item.preferences || "Open to offers"}
                    </div>
                  </div>

                  {isLoggedIn ? (
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => navigate(`/checkout/${item._id}`)}
                      >
                        🔒 Secure Checkout
                      </button>

                      {!isOwnProduct && (
                        <button
                          className="btn"
                          style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-color)",
                            color: "var(--primary)",
                          }}
                          onClick={() => setShowChat(true)}
                        >
                          💬 Chat
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "#fdf5e6",
                        border: "1px dashed var(--secondary)",
                        padding: "16px",
                        borderRadius: "12px",
                        textAlign: "center",
                        color: "var(--accent-swap)",
                        fontWeight: 600,
                      }}
                    >
                      Login to buy or chat.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <section className="commentsSection">
            <h2
              style={{
                fontFamily: "Lora, serif",
                fontSize: "1.4rem",
                fontWeight: 700,
                marginBottom: "20px",
              }}
            >
              ❓ Discussion & Questions ({comments?.length || 0})
            </h2>

            {isLoggedIn ? (
              <form
                onSubmit={handlePostComment}
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "32px",
                }}
              >
                <input
                  type="text"
                  className="formInput"
                  placeholder="Ask the seller a question..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addCommentMutation.isPending}
                >
                  Ask Question
                </button>
              </form>
            ) : (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                  fontStyle: "italic",
                  marginBottom: "32px",
                }}
              >
                Please log in or register to ask questions.
              </p>
            )}

            {isCommentsLoading ? (
              <p style={{ color: "var(--text-muted)" }}>Loading comments...</p>
            ) : (
              <div className="commentsList">
                {comments?.map((comment) => (
                  <div key={comment.id} className="commentCard">
                    <div className="commentHeader">
                      <div
                        className="navAvatar"
                        style={{
                          width: "24px",
                          height: "24px",
                          fontSize: "0.75rem",
                        }}
                      >
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
                        onClick={() =>
                          setActiveReplyId(
                            activeReplyId === comment.id ? null : comment.id,
                          )
                        }
                      >
                        Reply
                      </button>
                    )}

                    {activeReplyId === comment.id && (
                      <form
                        onSubmit={(e) => handlePostReply(e, comment.id)}
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "8px",
                          marginLeft: "16px",
                        }}
                      >
                        <input
                          type="text"
                          className="formInput"
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          style={{
                            padding: "8px 12px",
                            fontSize: "0.88rem",
                          }}
                        />

                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{
                            padding: "8px 16px",
                            fontSize: "0.88rem",
                          }}
                        >
                          Reply
                        </button>
                      </form>
                    )}

                    {comment.replies?.length > 0 && (
                      <div className="commentReplies">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply.id}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <div className="commentHeader">
                              <div
                                className="navAvatar"
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  fontSize: "0.65rem",
                                }}
                              >
                                {reply.user.substring(0, 2).toUpperCase()}
                              </div>

                              <span
                                className="commentUser"
                                style={{ fontSize: "0.85rem" }}
                              >
                                {reply.user}
                              </span>

                              <span className="commentTime">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p
                              className="commentBody"
                              style={{ fontSize: "0.88rem" }}
                            >
                              {reply.text}
                            </p>
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

        {chatOpen && isDesktop && (
          <aside className="detailChatSide">{chatPanel}</aside>
        )}
      </div>

      {chatOpen && !isDesktop && (
        <div className="detailChatOverlay">{chatPanel}</div>
      )}
    </div>
  );
}

export default ItemDetailPage;
