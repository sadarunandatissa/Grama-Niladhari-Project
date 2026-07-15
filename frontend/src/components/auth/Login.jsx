import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Stripping rememberMe if your backend login context doesn't expect it
      const { email, password } = formData;
      const response = await login({ email, password });

      const role = response.user.role;
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "gn_officer") navigate("/officer/dashboard");
      else navigate("/citizen/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main class="login-page-wrapper">
      <div className="login-container">
        {/* Left Section: Illustration */}
        <section className="illustration-section">
          <div className="illustration-wrapper">
            <img
              src="./src/assets/20945597.jpg"
              alt="Login Illustration"
              className="promo-image"
            />
          </div>
        </section>

        {/* Right Section: Login Form */}
        <section className="form-section">
          <div className="form-wrapper">
            <header className="form-header">
              <h1>Welcome Back</h1>
              <p>Your services are just a click away</p>
            </header>

            {error && <div className="alert error">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="form-options">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember Me</span>
                </label>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="register-redirect">
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
