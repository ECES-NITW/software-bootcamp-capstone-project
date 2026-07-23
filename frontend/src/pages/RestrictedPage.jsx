import { useNavigate } from "react-router-dom";

function RestrictedPage({ featureName }) {
    const navigate = useNavigate();

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
                padding: "20px",
            }}
        >
            <div
                className="glassCard restrictedCard"
                style={{
                    textAlign: "center",
                    padding: "40px 24px",
                    maxWidth: "480px",
                    border: "1.5px dashed var(--border-color)",
                    borderRadius: "24px",
                }}
            >
                <span
                    style={{
                        fontSize: "3rem",
                        display: "block",
                        marginBottom: "16px",
                    }}
                >
                    ✨
                </span>
                <h3
                    style={{
                        fontFamily: "Lora, serif",
                        fontSize: "1.4rem",
                        marginBottom: "12px",
                    }}
                >
                    {featureName} Page
                </h3>
                <p
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "0.95rem",
                        marginBottom: "24px",
                        lineHeight: "1.5",
                    }}
                >
                    This module is open for further development. Frontend
                    components and API integrations can be wired directly into
                    this page.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/")}
                >
                    Go Back Home
                </button>
            </div>
        </div>
    );
}

export default RestrictedPage;
