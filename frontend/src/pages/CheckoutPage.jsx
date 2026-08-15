import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useProduct } from "../hooks/useProducts";
import { useAgreedPrice } from "../hooks/useChat";
import api from "../api/api";

function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderType = searchParams.get("type") || "buy";

  const [days, setDays] = useState(7);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: item, isLoading, isError } = useProduct(id);
  const { data: agreedPrice } = useAgreedPrice(id);

  const rentPrice = item ? Number(item.rentPrice ?? item.price ?? 0) : 0;
  const depositPrice = item ? Number(item.deposit ?? 0) : 0;
  const listPrice = item ? Number(item.price ?? 0) : 0;
  const hasAgreedPrice = agreedPrice != null;
  const buyPrice = hasAgreedPrice ? Number(agreedPrice) : listPrice;

  const totalAmount =
    orderType === "rent" ? (rentPrice / 7) * days + depositPrice : buyPrice;

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 16) {
      value = value.slice(0, 16);
    }

    setCardNumber(value.match(/.{1,4}/g)?.join(" ") || value);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    setCardExpiry(
      value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value,
    );
  };

  const handleCVVChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 3) {
      value = value.slice(0, 3);
    }

    setCardCVV(value);
  };

  const handlePayment = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const checkoutPayload = {
        productId: id,
        orderType,

        ...(orderType === "rent" && {
          rentalStartDate: new Date(),
          rentalEndDate: new Date(
            Date.now() + Number(days) * 24 * 60 * 60 * 1000,
          ),
        }),
      };

      const checkoutResponse = await api.post("/orders", checkoutPayload);

      const order = checkoutResponse.data.order;

      if (!order?._id) {
        throw new Error("Order was not created");
      }

      if (orderType === "rent") {
        alert(
          "Rental order placed successfully! Waiting for the seller to accept.",
        );
      } else if (orderType === "exchange") {
        alert(
          "Exchange request placed successfully! Waiting for the seller to accept.",
        );
      } else {
        alert(
          "Purchase request placed! You can pay from My Orders once the seller accepts.",
        );
      }

      navigate("/orders");
    } catch (error) {
      console.error("Checkout error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Unable to place order",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "64px",
        }}
      >
        <div className="statusIndicator">
          <span className="statusDot statusDot-active"></span>
          <span>Loading checkout details...</span>
        </div>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div
        className="glassCard"
        style={{
          textAlign: "center",
          padding: "48px 0",
          border: "1px dashed #ef4444",
        }}
      >
        <p style={{ color: "#fca5a5" }}>Listing checkout details not found.</p>

        <button
          className="btn"
          style={{ marginTop: "16px" }}
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeInUp 0.4s ease-out" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "Lora, serif",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          {orderType === "rent"
            ? "🔒 Secure Rental Escrow"
            : "🔒 Secure Purchase"}
        </h1>

        <p style={{ color: "var(--text-muted)" }}>
          {orderType === "rent"
            ? "Submit your rental request. The seller will review and accept it before payment."
            : "Complete your purchase securely through Razorpay."}
        </p>
      </div>

      <div className="checkoutContainer">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <form
            className="glassCard"
            onSubmit={(e) => {
              e.preventDefault();
              handlePayment();
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <h3
              style={{
                fontFamily: "Lora, serif",
                fontSize: "1.2rem",
                fontWeight: 700,
              }}
            >
              {orderType === "rent" ? "Rental Request" : "Payment Information"}
            </h3>

            {orderType === "rent" && (
              <div className="formGroup">
                <label className="formLabel">Rental Duration (Days)</label>

                <input
                  type="number"
                  className="formInput"
                  value={days}
                  onChange={(e) =>
                    setDays(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min="1"
                  required
                />
              </div>
            )}

            {orderType !== "rent" && (
              <>
                <div className="formGroup">
                  <label className="formLabel">Cardholder Name</label>

                  <input
                    type="text"
                    className="formInput"
                    placeholder="e.g. Varshith Mummaneni"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                <div className="formGroup">
                  <label className="formLabel">Card Number</label>

                  <input
                    type="text"
                    inputMode="numeric"
                    className="formInput"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    required
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div className="formGroup">
                    <label className="formLabel">Expiration Date</label>

                    <input
                      type="text"
                      inputMode="numeric"
                      className="formInput"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      required
                    />
                  </div>

                  <div className="formGroup">
                    <label className="formLabel">CVV</label>

                    <input
                      type="password"
                      inputMode="numeric"
                      className="formInput"
                      placeholder="•••"
                      value={cardCVV}
                      onChange={handleCVVChange}
                      onFocus={() => setIsFlipped(true)}
                      onBlur={() => setIsFlipped(false)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div
              style={{
                marginTop: "8px",
                background: "var(--bg-secondary)",
                padding: "18px",
                borderRadius: "14px",
                border: "1px solid var(--border-color)",
              }}
            >
              {orderType === "rent" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span>Rental ({days} days)</span>

                    <span style={{ color: "var(--text-main)" }}>
                      ₹{((rentPrice / 7) * days).toFixed(2)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span>Refundable Deposit</span>

                    <span style={{ color: "var(--text-main)" }}>
                      ₹{depositPrice.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              {orderType !== "rent" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>
                    {hasAgreedPrice ? "Agreed Price" : "Purchase Amount"}
                  </span>

                  <span style={{ color: "var(--text-main)" }}>
                    {hasAgreedPrice && listPrice !== buyPrice && (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          textDecoration: "line-through",
                          marginRight: "8px",
                        }}
                      >
                        ₹{listPrice.toFixed(2)}
                      </span>
                    )}
                    ₹{buyPrice.toFixed(2)}
                  </span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "12px",
                  fontSize: "1.15rem",
                  fontWeight: 800,
                }}
              >
                <span>
                  {orderType === "rent"
                    ? "Total Escrow Amount"
                    : "Total Amount"}
                </span>

                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {orderType === "rent" && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "rgba(127, 143, 128, 0.08)",
                  border: "1px solid rgba(127, 143, 128, 0.25)",
                  color: "var(--text-muted)",
                  fontSize: "0.88rem",
                  lineHeight: 1.5,
                }}
              >
                ℹ️ No payment will be processed now. Your rental request will be
                sent to the seller for acceptance.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                width: "100%",
                marginTop: "4px",
                padding: "15px 20px",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 700,
                boxShadow: "0 8px 20px rgba(65, 90, 66, 0.15)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting
                ? "⏳ Processing..."
                : orderType === "rent"
                  ? `📩 Submit Rental Request`
                  : `🔒 Place Purchase Request (₹${totalAmount.toFixed(2)})`}
            </button>
          </form>
        </div>

        {orderType !== "rent" && (
          <div
            style={{
              position: "sticky",
              top: "100px",
            }}
          >
            <div className="creditCardWrapper">
              <div
                className="creditCard"
                style={{
                  transform: isFlipped ? "rotateY(180deg)" : "none",
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                  boxShadow: "0 20px 40px rgba(65, 90, 66, 0.15)",
                }}
              >
                {!isFlipped ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span className="cardLogo">🏢 NITW Student Union</span>

                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        PAYMENT CARD
                      </span>
                    </div>

                    <div className="cardChip"></div>

                    <div className="cardNumber">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>

                    <div className="cardDetails">
                      <div>
                        <div className="cardHolderLabel">Cardholder</div>

                        <div className="cardHolderVal">
                          {cardName || "Your Name"}
                        </div>
                      </div>

                      <div>
                        <div className="cardExpiryLabel">Expires</div>

                        <div className="cardExpiryVal">
                          {cardExpiry || "MM/YY"}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      transform: "rotateY(180deg)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        height: "36px",
                        background: "#000",
                        margin: "0 -24px",
                        marginTop: "8px",
                      }}
                    ></div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "12px",
                        background: "#fff",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        color: "#000",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.6rem",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          fontWeight: 600,
                        }}
                      >
                        CVV
                      </span>

                      <span
                        style={{
                          fontFamily: "Courier New",
                          fontWeight: 700,
                          fontStyle: "italic",
                        }}
                      >
                        {cardCVV || "•••"}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "0.55rem",
                        color: "rgba(255,255,255,0.4)",
                        textAlign: "center",
                      }}
                    >
                      Secure payment processing through Razorpay.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
