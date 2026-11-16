import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import AuthLayout from "../components/AuthLayout.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiError } from "../api/client.js";
import { getRoleHomePath } from "../utils/roleRoutes.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const user = await login({ email: email.trim(), password });
      toast.success("Welcome back.");
      const requestedPath = location.state?.from?.pathname;
      navigate(requestedPath || getRoleHomePath(user), { replace: true });
    } catch (error) {
      toast.error(getApiError(error, "Unable to sign in. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Enter your details below to continue to your workspace."
      footer={<>New here? <Link to="/signup" className="ml-1 font-semibold text-blood transition hover:text-red-800">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block" htmlFor="email">
          <span className="portal-label">Email address</span>
          <span className="relative block">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="portal-input pl-11" />
          </span>
        </label>
        <PasswordField value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        <button type="submit" disabled={submitting} className="portal-primary-button group mt-2 w-full">
          {submitting ? "Signing in…" : "Sign in"}
          {!submitting && <FiArrowRight className="transition group-hover:translate-x-1" size={17} />}
        </button>
      </form>
      <p className="mt-5 text-center text-xs leading-5 text-slate-400">Your session is verified through the existing account service.</p>
    </AuthLayout>
  );
}
