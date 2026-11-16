import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiDroplet,
  FiHeart,
  FiMapPin,
  FiMenu,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Brand from "../components/Brand.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getRoleHomePath } from "../utils/roleRoutes.js";

const bloodGroups = ["O−", "O+", "A−", "A+", "B−", "B+", "AB−", "AB+"];

const plannedSteps = [
  {
    icon: FiActivity,
    number: "01",
    title: "Share what is needed",
    description: "A request will include the blood group, location, and urgency once secure request intake is available.",
  },
  {
    icon: FiUsers,
    number: "02",
    title: "Find a suitable donor",
    description: "Future matching will consider compatible blood type, donor availability, distance, and screening.",
  },
  {
    icon: FiShield,
    number: "03",
    title: "Connect with consent",
    description: "Donor contact details should only be shared after a donor accepts a specific request.",
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboardPath = getRoleHomePath(user);

  function showRequestStatus() {
    toast.error("Emergency request intake is not connected yet.");
  }

  return (
    <div className="overflow-hidden bg-canvas text-ink">
      <header className="relative z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="Rabta home" className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blood">
            <Brand />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <a href="#blood-groups" className="text-sm font-medium text-slate-600 transition hover:text-blood">Blood groups</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition hover:text-blood">How it works</a>
            <a href="#portal-status" className="text-sm font-medium text-slate-600 transition hover:text-blood">Portal status</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!loading && user ? (
              <Link to={dashboardPath} className="portal-primary-button">
                Open dashboard <FiArrowUpRight />
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-blood">Sign in</Link>
                <Link to="/signup" className="portal-primary-button">Create account <FiArrowRight /></Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-ink md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-line bg-white px-5 py-4 md:hidden" aria-label="Mobile navigation">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <a onClick={() => setMenuOpen(false)} href="#blood-groups" className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-blood">Blood groups</a>
              <a onClick={() => setMenuOpen(false)} href="#how-it-works" className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-blood">How it works</a>
              <a onClick={() => setMenuOpen(false)} href="#portal-status" className="rounded-lg px-3 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-blood">Portal status</a>
              {!loading && user ? (
                <Link onClick={() => setMenuOpen(false)} to={dashboardPath} className="portal-primary-button mt-2">Open dashboard</Link>
              ) : (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link onClick={() => setMenuOpen(false)} to="/login" className="portal-secondary-button">Sign in</Link>
                  <Link onClick={() => setMenuOpen(false)} to="/signup" className="portal-primary-button">Join Rabta</Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      <main>
        <section className="relative isolate">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_5%,rgba(198,40,40,.08),transparent_35rem)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white px-3.5 py-2 text-xs font-bold tracking-wide text-blood shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blood" />
                A voluntary blood donation community · Pakistan
              </span>
              <h1 className="mt-7 max-w-2xl font-['Manrope'] text-4xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-[3.7rem]">
                When every minute matters, <span className="text-blood">connection matters.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Rabta is being built to help people reach blood donors and trusted care providers with privacy, consent, and clinical safety at the center.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={showRequestStatus} className="portal-primary-button min-h-12 px-6">
                  <FiHeart size={17} /> Request emergency blood
                </button>
                <Link to="/signup" className="portal-secondary-button min-h-12 px-6">
                  Become a donor <FiArrowRight size={17} />
                </Link>
              </div>
              <p className="mt-4 max-w-xl text-xs leading-5 text-slate-500">
                Emergency request intake and donor enrollment are not connected yet. Account signup creates a regular portal account only.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-2"><FiShield className="text-emerald-700" /> Privacy-first by design</span>
                <span className="inline-flex items-center gap-2"><FiMapPin className="text-blood" /> Built for Pakistan</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[540px]">
              <div className="absolute -left-7 top-16 hidden h-28 w-28 rounded-full bg-red-100/80 blur-2xl sm:block" />
              <div className="absolute -right-7 bottom-10 hidden h-36 w-36 rounded-full bg-orange-100 blur-2xl sm:block" />
              <div className="relative overflow-hidden rounded-[2rem] border border-red-100 bg-white p-5 shadow-[0_30px_90px_rgba(115,28,28,.12)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="portal-eyebrow">Together, with care</p>
                    <h2 className="mt-2 font-['Manrope'] text-2xl font-extrabold text-ink">A safer way to reach out</h2>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-soft-red text-blood">
                    <FiDroplet size={23} fill="currentColor" />
                  </span>
                </div>
                <div className="mt-7 rounded-2xl bg-[#FFF7F7] p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">The promise</span>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm">Consent-led</span>
                  </div>
                  <p className="mt-4 font-['Manrope'] text-2xl font-bold leading-snug text-ink">
                    People first. <span className="text-blood">Privacy always.</span>
                  </p>
                  <div className="mt-6 space-y-3">
                    {[
                      ["01", "No public phone numbers or home addresses"],
                      ["02", "Donor contact shared only after acceptance"],
                      ["03", "Clinical decisions remain with hospital staff"],
                    ].map(([step, text]) => (
                      <div key={step} className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-soft-red text-[11px] font-bold text-blood">{step}</span>
                        <span className="text-xs font-medium leading-5 text-slate-600 sm:text-sm">{text}</span>
                        <FiCheckCircle className="ml-auto shrink-0 text-emerald-700" size={16} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2"><FiHeart className="text-blood" /> A non-commercial initiative</span>
                  <span>Rabta · Pakistan</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="blood-groups" className="scroll-mt-24 border-y border-line bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="portal-eyebrow">Blood groups</p>
                <h2 className="mt-2 font-['Manrope'] text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Every group matters.</h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-slate-500">
                Common ABO/Rh groups are shown for information. Compatibility is product-specific and must be confirmed by qualified hospital staff.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {bloodGroups.map((group, index) => (
                <div key={group} className={`group rounded-2xl border p-4 text-center transition hover:-translate-y-1 hover:shadow-card ${index % 2 === 0 ? "border-red-100 bg-[#FFF9F9]" : "border-line bg-slate-50"}`}>
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white font-['Manrope'] text-sm font-extrabold text-blood shadow-sm transition group-hover:bg-blood group-hover:text-white">{group}</span>
                  <p className="mt-3 text-xs font-semibold text-slate-500">Blood type</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="portal-status" className="scroll-mt-24 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="portal-card overflow-hidden p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Platform in development
                  </span>
                  <h2 className="mt-4 font-['Manrope'] text-2xl font-extrabold text-ink sm:text-3xl">Real progress needs real data.</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Live donor, request, and partner statistics will appear when those verified services are connected. No numbers are estimated here.
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-400">Live service metrics · not connected</span>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard icon={FiUsers} label="Registered donors" value="—" />
                <MetricCard icon={FiActivity} label="Open requests" value="—" />
                <MetricCard icon={FiCheckCircle} label="Verified partners" value="—" />
                <MetricCard icon={FiClock} label="Requests connected" value="—" />
              </div>
              <p className="mt-5 border-t border-line pt-4 text-xs leading-5 text-slate-400">
                The number of blood groups shown above is an informational category list, not a count of available donors or stock.
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 border-y border-line bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="portal-eyebrow">The intended journey</p>
              <h2 className="mt-2 font-['Manrope'] text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Designed around care, not just clicks.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                This is the planned flow. Request intake, donor matching, and partner verification are not active in the connected backend yet.
              </p>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {plannedSteps.map(({ icon: Icon, number, title, description }) => (
                <article key={number} className="portal-card group p-6 transition hover:-translate-y-1 hover:shadow-card sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-soft-red text-blood transition group-hover:bg-blood group-hover:text-white"><Icon size={21} /></span>
                    <span className="font-['Manrope'] text-sm font-extrabold text-red-200">{number}</span>
                  </div>
                  <h3 className="mt-6 font-['Manrope'] text-lg font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#9F1D24] via-blood to-[#7F1D1D] px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14">
              <div className="pointer-events-none absolute -right-12 -top-32 h-72 w-72 rounded-full border border-white/10" />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-100">Join the community</p>
                  <h2 className="mt-3 max-w-2xl font-['Manrope'] text-3xl font-extrabold leading-tight sm:text-4xl">A small step can make a meaningful difference.</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50/85">
                    Create a portal account now. Donor registration and emergency request forms will be enabled after their secure backend workflows are ready.
                  </p>
                </div>
                <Link to="/signup" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blood shadow-sm transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Create an account <FiArrowUpRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Brand compact />
            <div>
              <p className="text-sm font-bold text-ink">Rabta</p>
              <p className="text-xs text-slate-400">Voluntary blood donation · Pakistan</p>
            </div>
          </div>
          <p className="max-w-xl text-xs leading-5 text-slate-400">
            Informational only. Blood compatibility and transfusion decisions belong to qualified medical professionals and require hospital crossmatching.
          </p>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link to="/login" className="text-slate-500 hover:text-blood">Sign in</Link>
            <Link to="/signup" className="text-blood hover:text-red-800">Create account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-slate-50 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-blood shadow-sm"><Icon size={18} /></span>
      <div>
        <p className="font-['Manrope'] text-xl font-extrabold text-ink">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
