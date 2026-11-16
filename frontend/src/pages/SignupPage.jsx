import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import AuthLayout from "../components/AuthLayout.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiError } from "../api/client.js";
import { getRoleHomePath } from "../utils/roleRoutes.js";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    const username = name.trim();
    if (!username) {
      toast.error("Enter your full name.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await signup({ username, email: email.trim(), password });
      toast.success("Your account is ready.");
      navigate(getRoleHomePath(user), { replace: true });
    } catch (error) {
      toast.error(getApiError(error, "Unable to create your account. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      description="Set up your account and make this workspace yours."
      footer={<>Already have an account? <Link to="/login" className="ml-1 font-semibold text-blood transition hover:text-red-800">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block" htmlFor="name">
          <span className="portal-label">Full name</span>
          <span className="relative block">
            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input id="name" name="name" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="portal-input pl-11" />
          </span>
        </label>
        <label className="block" htmlFor="email">
          <span className="portal-label">Email address</span>
          <span className="relative block">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">@</span>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="portal-input pl-11" />
          </span>
        </label>
        <PasswordField id="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
        <PasswordField id="confirmPassword" label="Confirm password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
        <button type="submit" disabled={submitting} className="portal-primary-button group mt-2 w-full">
          {submitting ? "Creating account…" : "Create account"}
          {!submitting && <FiArrowRight className="transition group-hover:translate-x-1" size={17} />}
        </button>
      </form>
      <p className="mt-4 text-center text-xs leading-5 text-slate-400">
        Donor enrollment is not active yet; this signup creates a regular portal account.
      </p>
    </AuthLayout>
  );
}
