import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiActivity,
  FiCheckCircle,
  FiEye,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  changeUserRole,
  deleteUser,
  getAdminStats,
  getAdminUsers,
  setUserStatus,
} from "../api/admin.js";
import { getApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const PAGE_SIZE = 10;
const numberFormatter = new Intl.NumberFormat();

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    violet: "bg-red-50 text-blood ring-red-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-sky-50 text-sky-700 ring-sky-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
  };

  return (
    <article className="portal-card p-5 transition hover:-translate-y-0.5 hover:shadow-card sm:p-6">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ring-1 ${tones[tone]}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-5 font-['Manrope'] text-3xl font-extrabold tracking-tight text-ink">
        {value == null ? "—" : numberFormatter.format(value)}
      </p>
    </article>
  );
}

function UserDetailsDialog({ user, onClose }) {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
        className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blood">Account details</p>
            <h2 id="user-details-title" className="mt-2 font-['Manrope'] text-xl font-bold text-ink">
              {user.username}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-ink" aria-label="Close details">
            ×
          </button>
        </div>
        <dl className="mt-6 space-y-4">
          <div>
            <dt className="text-xs text-slate-500">Email</dt>
            <dd className="mt-1 break-all text-sm text-ink">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Role</dt>
            <dd className="mt-1 text-sm capitalize text-ink">{user.role}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Status</dt>
            <dd className="mt-1 text-sm capitalize text-ink">{user.status ?? "active"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Account ID</dt>
            <dd className="mt-1 break-all font-mono text-xs text-slate-500">{user._id}</dd>
          </div>
        </dl>
        <p className="mt-6 border-t border-line pt-4 text-xs leading-5 text-slate-500">
          These fields are the account details returned by the admin users API. Password and other private credentials are not exposed.
        </p>
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const usersRequestId = useRef(0);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getAdminStats());
    } catch (requestError) {
      toast.error(getApiError(requestError, "Unable to load account statistics."));
    }
  }, []);

  const loadUsers = useCallback(async () => {
    const requestId = usersRequestId.current + 1;
    usersRequestId.current = requestId;
    setLoading(true);
    setError("");
    try {
      const response = await getAdminUsers(page, PAGE_SIZE, {
        search,
        role: roleFilter,
        status: statusFilter,
      });
      if (requestId !== usersRequestId.current) return;
      setUsers(response.data);
      setPagination(response.pagination);
      const lastPage = Math.max(response.pagination.totalPages, 1);
      if (page > lastPage) setPage(lastPage);
    } catch (requestError) {
      if (requestId !== usersRequestId.current) return;
      const message = getApiError(requestError, "Unable to load user accounts.");
      setError(message);
      toast.error(message);
    } finally {
      if (requestId === usersRequestId.current) setLoading(false);
    }
  }, [page, roleFilter, search, statusFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadUsers();
    return () => {
      usersRequestId.current += 1;
    };
  }, [loadUsers]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  async function performUserAction(action, successMessage) {
    try {
      await action();
      toast.success(successMessage);
      await Promise.all([loadUsers(), loadStats()]);
    } catch (requestError) {
      toast.error(getApiError(requestError, "Unable to update this account."));
    } finally {
      setBusyUserId("");
    }
  }

  function updateRole(account, role) {
    if (role === account.role) return;
    setBusyUserId(account._id);
    performUserAction(() => changeUserRole(account._id, role), "User role updated.");
  }

  function updateStatus(account) {
    const status = (account.status ?? "active") === "blocked" ? "active" : "blocked";
    setBusyUserId(account._id);
    performUserAction(() => setUserStatus(account._id, status), `Account ${status === "active" ? "unblocked" : "blocked"}.`);
  }

  function removeUser(account) {
    if (!window.confirm(`Delete the account for ${account.username}? This cannot be undone.`)) return;
    setBusyUserId(account._id);
    performUserAction(() => deleteUser(account._id), "User account deleted.");
  }

  return (
    <div className="animate-[fade-in_.35s_ease-out]">
      <header className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blood">
            <span className="h-1.5 w-1.5 rounded-full bg-blood" />
            Administration
          </p>
          <h1 className="font-['Manrope'] text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Admin dashboard<span className="text-blood">.</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">Review account activity and manage registered users.</p>
        </div>
        <span className="flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          <FiShield size={14} /> Admin access
        </span>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FiUsers} label="Registered users" value={stats?.totalUsers} tone="violet" />
        <StatCard icon={FiCheckCircle} label="Active users" value={stats?.activeUsers} tone="emerald" />
        <StatCard icon={FiShield} label="Administrators" value={stats?.adminUsers} tone="blue" />
        <StatCard icon={FiActivity} label="Blocked accounts" value={stats?.blockedUsers} tone="rose" />
      </section>

      <section className="portal-card mt-8 overflow-hidden">
        <div className="flex flex-col gap-5 border-b border-line px-5 py-5 sm:px-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-['Manrope'] text-lg font-bold text-ink">Registered users</h2>
              <p className="mt-1 text-xs text-slate-500">
                {numberFormatter.format(pagination.total)} accounts · role and status changes use admin-only API routes
              </p>
            </div>
            <p className="max-w-sm text-xs leading-5 text-slate-500 sm:text-right">
              The API supports role/status changes and deletion, but not admin-created accounts or name/email editing. Public signup creates regular users.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_170px_170px]">
            <label className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 focus-within:border-blood">
              <FiSearch className="shrink-0 text-slate-500" size={16} />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name or email"
                aria-label="Search users by name or email"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
              />
            </label>
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter users by role"
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-blood"
            >
              <option value="">All roles</option>
              <option value="user">Regular user</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter users by status"
              className="h-11 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-blood"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {error && (
          <div role="alert" className="m-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <span>{error}</span>
            <button onClick={loadUsers} className="font-semibold text-rose-800 underline underline-offset-2">Retry</button>
          </div>
        )}

        <div className="soft-scrollbar overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Account</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((account) => {
                const isCurrentUser = String(account._id) === String(currentUser?.id);
                const isBusy = busyUserId === account._id;
                const status = account.status ?? "active";
                return (
                  <tr key={account._id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink">{account.username}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{account.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={account.role}
                        disabled={isCurrentUser || isBusy}
                        onChange={(event) => updateRole(account, event.target.value)}
                        aria-label={`Role for ${account.username}`}
                        className="rounded-lg border border-line bg-white px-2.5 py-2 text-xs capitalize text-ink outline-none focus:border-blood disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => updateStatus(account)}
                        disabled={isCurrentUser || isBusy}
                        aria-label={`${status === "blocked" ? "Unblock" : "Block"} ${account.username}`}
                        title={isCurrentUser ? "You cannot block your own account" : undefined}
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          status === "blocked"
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status === "blocked" ? "bg-rose-600" : "bg-emerald-600"}`} />
                        {status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(account)}
                          aria-label={`View ${account.username} details`}
                          className="rounded-lg border border-line p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => removeUser(account)}
                          disabled={isCurrentUser || isBusy}
                          aria-label={`Delete ${account.username}`}
                          title={isCurrentUser ? "You cannot delete your own account" : undefined}
                          className="rounded-lg border border-line p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && !error && users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-500">
                    No user accounts match these filters.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-8">
                    <div role="status" aria-label="Loading user accounts" className="mx-auto max-w-xl space-y-3">
                      <div className="portal-skeleton h-4 w-2/3" />
                      <div className="portal-skeleton h-4 w-full" />
                      <div className="portal-skeleton h-4 w-4/5" />
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-slate-500">
            Showing {users.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{(page - 1) * PAGE_SIZE + users.length} of {numberFormatter.format(pagination.total)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 text-xs text-slate-500">Page {page} of {Math.max(pagination.totalPages, 1)}</span>
            <button
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= pagination.totalPages || loading}
              className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </footer>
      </section>

      <UserDetailsDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
