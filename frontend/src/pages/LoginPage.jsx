import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const registered = Boolean(location.state?.registered);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(`/auth/login`, { email, password });
            const data = res.data;

            localStorage.setItem("access_token", data.token);
            // Token now exists, so useUser's `enabled` gate flips on. Invalidate
            // so it refetches the profile fresh instead of a stale disabled state.
            await queryClient.invalidateQueries({ queryKey: ["user"] });

            navigate(location.state?.from?.pathname || "/feed", { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Could not reach the server.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleLogin}>
                <h1 className="auth-title">Sign in</h1>

                {registered && !error && (
                    <p style={{ color: "var(--primary)", fontSize: "0.9rem", marginBottom: "8px" }}>
                        Account created successfully. Please sign in.
                    </p>
                )}
                {error && <p className="auth-error">{error}</p>}

                <label className="auth-field">
                    <span>Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@college.edu"
                        autoComplete="email"
                    />
                </label>

                <label className="auth-field">
                    <span>Password</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />
                </label>

                <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                <p className="auth-switch">
                    New here? <Link to="/register">Create an account</Link>
                </p>
            </form>
        </div>
    );
}

export default LoginPage;