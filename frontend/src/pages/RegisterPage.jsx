import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

function RegisterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !phoneNumber || !password) {
            setError("All fields are required.");
            return;
        }
        if (!/^\d{10}$/.test(phoneNumber)) {
            setError("Phone number must be 10 digits.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/auth/register`, { userName: name, email, phoneNumber, password });
            navigate("/login", { state: { registered: true } });
        } catch (err) {
            setError(err.response?.data?.message || "Could not reach the server.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleRegister}>
                <h1 className="auth-title">Create account</h1>

                {error && <p className="auth-error">{error}</p>}

                <label className="auth-field">
                    <span>Name</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        autoComplete="name"
                    />
                </label>

                <label className="auth-field">
                    <span>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@student.nitw.ac.in"
                        autoComplete="email"
                    />
                </label>

                <label className="auth-field">
                    <span>Phone Number</span>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit phone number"
                        maxLength={10}
                        autoComplete="tel"
                    />
                </label>

                <label className="auth-field">
                    <span>Password</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                    />
                </label>

                <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                </button>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </form>
        </div>
    );
}

export default RegisterPage;