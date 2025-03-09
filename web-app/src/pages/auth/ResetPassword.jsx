import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showResendButton, setShowResendButton] = useState(false);
  const [email, setEmail] = useState(""); // Email for resending reset link

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing reset token.");
      setShowResendButton(true);
    }
  }, [token]);

  const handleResetPassword = async e => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 3000); // Redirect to login after success
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "An error occurred.");
      if (error.response?.data?.error === "Reset link has expired. Request a new one.") {
        setShowResendButton(true);
      }
    }
  };

  const handleResendResetLink = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:4000/api/auth/resend-reset-link", {
        email,
      });

      setMessage(response.data.message);
      setShowResendButton(false);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Error sending reset link.");
    }
  };

  return (
    <div className="container">
      <h2>Reset Password</h2>
      {message && <p>{message}</p>}

      {!showResendButton ? (
        <form onSubmit={handleResetPassword}>
          <label>
            New Password:
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Confirm Password:
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Reset Password</button>
        </form>
      ) : (
        <div>
          <p>Enter your email to receive a new reset link:</p>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button onClick={handleResendResetLink}>Resend Reset Link</button>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
