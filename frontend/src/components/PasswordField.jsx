import { useState } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";

export default function PasswordField({ id = "password", label = "Password", value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block" htmlFor={id}>
      <span className="portal-label">{label}</span>
      <span className="relative block">
        <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          className="portal-input pr-12 pl-11"
          placeholder="Enter your password"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-blood focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
        >
          {visible ? <FiEyeOff size={17} /> : <FiEye size={17} />}
        </button>
      </span>
    </label>
  );
}
