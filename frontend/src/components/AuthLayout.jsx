import { Link } from "react-router-dom";
import { FiArrowUpRight, FiHeart, FiShield } from "react-icons/fi";
import Brand from "./Brand.jsx";

export default function AuthLayout({ children, eyebrow, title, description, footer }) {
  return (
    <main className="min-h-screen bg-canvas lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(460px,.95fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#9F1D24] via-blood to-[#7F1D1D] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="pointer-events-none absolute -right-28 top-16 h-96 w-96 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-10 top-32 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute bottom-28 right-20 h-48 w-48 rounded-full bg-white/[0.06] blur-2xl" />
        <Link to="/" className="relative inline-flex w-fit rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <Brand inverse />
        </Link>
        <div className="relative max-w-xl py-16">
          <div className="mb-8 grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/10">
            <FiHeart size={30} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-100">{eyebrow}</p>
          <h1 className="mt-4 font-['Manrope'] text-4xl font-extrabold leading-tight xl:text-5xl">
            A community ready to help, when it matters most.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-red-50/85">
            Rabta is being built around safer, consent-led connections between people and blood services across Pakistan.
          </p>
          <div className="mt-10 flex items-center gap-3 text-sm text-red-50/90">
            <FiShield size={18} />
            <span>Private by design. Verified before connection.</span>
          </div>
        </div>
        <div className="relative flex items-center justify-between border-t border-white/15 pt-5 text-xs text-red-100/80">
          <span>Pakistan · Voluntary blood donation</span>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-white">Explore Rabta <FiArrowUpRight /></Link>
        </div>
      </aside>

      <section className="flex min-h-screen flex-col px-5 py-7 sm:px-10 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/" className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"><Brand /></Link>
          <span className="rounded-full bg-soft-red px-3 py-1.5 text-xs font-semibold text-blood">Pakistan</span>
        </div>
        <div className="my-auto flex w-full flex-1 items-center justify-center py-10">
          <div className="glass-panel w-full max-w-[460px] rounded-3xl p-7 sm:p-10">
            <div className="mb-8">
              <p className="portal-eyebrow">{eyebrow}</p>
              <h2 className="mt-3 font-['Manrope'] text-3xl font-extrabold tracking-tight text-ink sm:text-[2.1rem]">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
            </div>
            {children}
            <div className="mt-8 border-t border-line pt-6 text-center text-sm text-slate-500">
              {footer}
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400">A voluntary, non-commercial blood donation community.</p>
      </section>
    </main>
  );
}
