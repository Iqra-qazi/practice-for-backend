import { FiDroplet } from "react-icons/fi";

export default function Brand({ compact = false, inverse = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-10 w-10 place-items-center rounded-xl shadow-sm ${inverse ? "bg-white text-blood" : "bg-blood text-white"}`}>
        <FiDroplet size={20} fill="currentColor" />
      </span>
      {!compact && (
        <span className={`font-['Manrope'] text-lg font-extrabold tracking-tight ${inverse ? "text-white" : "text-ink"}`}>
          Rabta<span className={`ml-1 ${inverse ? "text-red-100" : "text-blood"}`}>.</span>
        </span>
      )}
    </div>
  );
}
