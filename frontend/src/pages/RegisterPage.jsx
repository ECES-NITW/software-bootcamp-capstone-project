import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

function RegisterPage() {
<<<<<<< HEAD
  const navigate = useNavigate();
=======
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
>>>>>>> 62ee51df517e1f440d32111ff5194eb04c7bfd95

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  const handleRegister = async () => {
    setError("");

    if (!name || !email || !phoneNumber || !password) {
      setError("All fields are required.");
      return;
    }
=======
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
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Could not reach the server.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
>>>>>>> 62ee51df517e1f440d32111ff5194eb04c7bfd95

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setError("Phone number must be 10 digits.");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/auth/register`, {
        userName: name,
        email,
        phoneNumber,
        password,
      });

<<<<<<< HEAD
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reach the server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
=======
                <label className="auth-field">
                    <span>Phone Number</span>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit phone number"
                        maxLength={10}
                    />
                </label>

                <label className="auth-field">
                    <span>Password</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    />
                </label>
>>>>>>> 62ee51df517e1f440d32111ff5194eb04c7bfd95

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>

        {error && <p className="auth-error">{error}</p>}

        <label className="auth-field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </label>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@student.nitw.ac.in"
          />
        </label>

        <label className="auth-field">
          <span>Phone Number</span>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="10-digit phone number"
            maxLength={10}
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          />
        </label>

        <button
          className="auth-btn"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
