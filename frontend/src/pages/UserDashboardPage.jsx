import {
  FiBell,
  FiCheckCircle,
  FiClock,
  FiDroplet,
  FiGlobe,
  FiHeart,
  FiInfo,
  FiSearch,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { UserAvatar } from "../components/AppLayout.jsx";

const donorFeatures = [
  "Donor profile, phone verification, and medical screening",
  "Availability, donation interval, and donation history",
  "Nearby requests and accept/decline actions",
  "Privacy preferences and donor notifications",
];

const patientFeatures = [
  "Emergency blood request creation and tracking",
  "Your request statuses and responding donors",
  "Donor search and consent-based contact",
  "Request history, notifications, and feedback",
];

function ComingSoonPanel({ icon: Icon, title, description, features, missingApis }) {
  return (
    <article className="portal-card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-soft-red text-blood">
          <Icon size={20} />
        </span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
          Coming soon
        </span>
      </div>
      <h2 className="mt-5 font-['Manrope'] text-xl font-extrabold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <ul className="mt-5 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-sm leading-5 text-slate-600">
            <FiClock className="mt-0.5 shrink-0 text-slate-400" size={15} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <p className="mt-auto border-t border-line pt-4 text-xs leading-5 text-slate-500">
        Required API support is not available: <span className="font-medium text-slate-600">{missingApis}</span>
      </p>
    </article>
  );
}

export default function UserDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="animate-[fade-in_.35s_ease-out]">
      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blood">
            <span className="h-1.5 w-1.5 rounded-full bg-blood" />
            User workspace
          </p>
          <h1 className="font-['Manrope'] text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Your portal dashboard<span className="text-blood">.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Your account is active. Donor and patient services will appear here when their secure backend workflows are available.
          </p>
        </div>
        <span className="flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          <FiCheckCircle size={14} /> Signed in
        </span>
      </header>

      <section className="portal-card relative overflow-hidden bg-gradient-to-br from-white via-white to-red-50 p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full bg-red-100/70 blur-[80px]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="h-12 w-12" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blood">Authenticated account</p>
              <h2 className="mt-1 truncate font-['Manrope'] text-lg font-bold text-ink">{user?.name || "Your account"}</h2>
              <p className="truncate text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-slate-600 sm:self-auto">
            <FiUser className="text-blood" />
            <span className="capitalize">{user?.role || "user"} account</span>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2" aria-label="Dashboard availability">
        <ComingSoonPanel
          icon={FiDroplet}
          title="Donor dashboard"
          description="Donor-specific data is not collected or shown in this account workspace."
          features={donorFeatures}
          missingApis="donor profile, availability, history, and request endpoints"
        />
        <ComingSoonPanel
          icon={FiHeart}
          title="Patient / requester dashboard"
          description="Emergency requests and donor responses cannot be created or tracked yet."
          features={patientFeatures}
          missingApis="request, donor search, response, and notification endpoints"
        />
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <UnavailableItem
          icon={FiShield}
          title="Profile and password"
          description="The connected API has no profile-edit or password-change endpoint."
        />
        <UnavailableItem
          icon={FiBell}
          title="Notifications"
          description="No in-app, SMS, or WhatsApp notification service is connected."
        />
        <UnavailableItem
          icon={FiGlobe}
          title="Language"
          description="Urdu and English switching is not implemented yet."
        />
      </section>

      <aside className="mt-6 flex gap-3 rounded-2xl border border-red-100 bg-red-50/70 p-4 sm:p-5" role="note">
        <FiInfo className="mt-0.5 shrink-0 text-blood" />
        <p className="text-sm leading-6 text-slate-600">
          The backend currently supports regular user and admin accounts only. Public signup does not enroll donors or patients. No blood-group, health, phone, request, or donor-contact details are stored or inferred on this page.
        </p>
      </aside>
    </div>
  );
}

function UnavailableItem({ icon: Icon, title, description }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <div className="flex items-center gap-2 text-sm font-bold text-ink">
        <Icon className="text-blood" size={17} /> {title}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-amber-700">Coming soon</p>
    </article>
  );
}
