"use client";

import { useState } from "react";
import { Role } from "@prisma/client";

interface User {
  id: string;
  username: string;
  fullName: string;
  employeeId?: string | null;
  role: Role;
  department?: string | null;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date | null;
}

const ROLES: Role[] = ["ADMIN", "MANAGER", "TECHNICIAN", "INSTALLER", "DISPATCHER", "CSR", "COMFORT_ADVISOR", "EMPLOYEE"];
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  TECHNICIAN: "bg-green-100 text-green-700",
  INSTALLER: "bg-teal-100 text-teal-700",
  DISPATCHER: "bg-orange-100 text-orange-700",
  CSR: "bg-pink-100 text-pink-700",
  COMFORT_ADVISOR: "bg-yellow-100 text-yellow-700",
  EMPLOYEE: "bg-slate-100 text-slate-700",
};

export default function UserManagementClient({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = users.filter((u) =>
    filter === "" ||
    u.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    u.username.toLowerCase().includes(filter.toLowerCase()) ||
    u.role.toLowerCase().includes(filter.toLowerCase())
  );

  async function handleCreate(data: Partial<User> & { password?: string }) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error); return; }
      setUsers((prev) => [json.data, ...prev]);
      setShowForm(false);
    } catch { setError("Request failed"); }
    finally { setLoading(false); }
  }

  async function handleToggleActive(user: User) {
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">{users.filter(u => u.isActive).length} active employees</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditUser(null); setError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Search by name, username, or role..."
        />
      </div>

      {/* User list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-10 text-sm">No users found</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <div key={user.id} className={`flex items-center gap-4 px-4 py-3 ${!user.isActive ? "opacity-50" : ""}`}>
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{user.fullName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
                      {user.role}
                    </span>
                    {!user.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Inactive</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    @{user.username}
                    {user.employeeId && ` · ID: ${user.employeeId}`}
                    {user.department && ` · ${user.department}`}
                  </div>
                  {user.lastLoginAt && (
                    <div className="text-xs text-slate-400">
                      Last login: {new Date(user.lastLoginAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                      user.isActive
                        ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create form modal */}
      {showForm && (
        <UserFormModal
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}

function UserFormModal({
  onClose,
  onSubmit,
  loading,
  error,
}: {
  onClose: () => void;
  onSubmit: (data: { username: string; password: string; fullName: string; role: Role; employeeId?: string; department?: string }) => void;
  loading: boolean;
  error: string;
}) {
  const [form, setForm] = useState({
    username: "", password: "", fullName: "", role: "EMPLOYEE" as Role,
    employeeId: "", department: "",
  });

  function set(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Add New Employee</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Full Name" required>
            <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputClass} placeholder="John Smith" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Username" required>
              <input value={form.username} onChange={(e) => set("username", e.target.value)} className={inputClass} placeholder="JohnTech01" autoCapitalize="none" />
            </Field>
            <Field label="Password" required>
              <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} className={inputClass} placeholder="Min 6 chars" />
            </Field>
          </div>
          <Field label="Role" required>
            <select value={form.role} onChange={(e) => set("role", e.target.value)} className={inputClass}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Employee ID">
              <input value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} className={inputClass} placeholder="Optional" />
            </Field>
            <Field label="Department">
              <input value={form.department} onChange={(e) => set("department", e.target.value)} className={inputClass} placeholder="Optional" />
            </Field>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSubmit({
              username: form.username, password: form.password, fullName: form.fullName,
              role: form.role, employeeId: form.employeeId || undefined, department: form.department || undefined,
            })}
            disabled={loading}
            className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {loading ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500";
