"use client";

import { motion } from "framer-motion";
import { Activity, BarChart3, CreditCard, LayoutDashboard, LogOut, ShieldAlert, Users } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AdminUser { id: number; name: string; email: string; role: string; isVerified: number; isBlocked: number; isSuspended: number; createdAt: string; }
interface Stats { totalStudents: number; totalTeachers: number; totalCourses: number; totalRevenue: number; }

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day(s) ago`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const [token, setToken] = useState("");
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, totalTeachers: 0, totalCourses: 0, totalRevenue: 0 });
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [userFilter, setUserFilter] = useState("all");
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!t || !userData) { router.push("/login"); return; }
    const u = JSON.parse(userData);
    if (u.role !== "admin") { router.push("/login"); return; }
    setAdminUser(u);
    setToken(t);
  }, [router]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [analyticsRes, usersRes, paymentsRes] = await Promise.all([
        fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/payments", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setStats(data.stats);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        const users: AdminUser[] = data.users.filter((u: AdminUser) => u.role !== "admin");
        setAllUsers(users);
        setRecentUsers(users.slice(0, 5));
      }
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments);
        setStats(prev => ({ ...prev, totalRevenue: data.totalRevenue }));
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredUsers = userFilter === "all" ? allUsers : allUsers.filter(u => u.role === userFilter);

  async function toggleBlock(userId: number, isBlocked: number) {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, isBlocked: !isBlocked }),
    });
    fetchData();
  }

  async function deleteUser(userId: number) {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchData();
  }

  const initials = adminUser?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) ?? "A";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex relative overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5 dark:opacity-10" 
             style={{ backgroundImage: 'url(/bgimages/e8c3a632-02b6-4bd6-8ef5-6407dde96335.jpeg)' }} />
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 dark:opacity-8" 
             style={{ backgroundImage: 'url(/bgimages/74d93df2-38cf-4960-ab43-a338f9e0db26.jpeg)' }} />
      </div>

      {/* Gradient Overlay for better contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50/97 via-slate-50/95 to-slate-50/97 dark:from-slate-950/97 dark:via-slate-950/95 dark:to-slate-950/97 pointer-events-none" />
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black text-slate-300 flex flex-col fixed h-full z-40 hidden md:flex">
        <div className="p-6 flex items-center gap-2 text-white">
          <ShieldAlert className="text-emerald-500 w-8 h-8" />
          <span className="text-2xl font-bold">Acharya Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { id: "overview", icon: LayoutDashboard, label: "Platform Overview" },
            { id: "users", icon: Users, label: "User Management" },
            { id: "payments", icon: CreditCard, label: "Payments & Subs" },
            { id: "analytics", icon: BarChart3, label: "Analytics" },
            { id: "activity", icon: Activity, label: "System Activity" },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${activeTab === item.id ? "bg-emerald-500 text-white" : "hover:bg-slate-800 text-slate-400"}`}>
              <item.icon size={18} />{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/"; }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors text-sm font-medium">
            <LogOut size={18} />Exit Console
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto md:ml-64">
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-xl font-bold capitalize">{activeTab.replace("-", " ")}</h1>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold">{adminUser?.name ?? "Admin"}</p>
                <p className="text-xs text-slate-500">{adminUser?.email ?? ""}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}` },
                  { label: "Total Courses", value: stats.totalCourses.toLocaleString() },
                  { label: "Total Students", value: stats.totalStudents.toLocaleString() },
                  { label: "Total Teachers", value: stats.totalTeachers.toLocaleString() },
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{stat.label}</p>
                    <p className="text-3xl font-black">{loading ? "—" : stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-lg">Recent User Registrations</h3>
                  <button onClick={() => setActiveTab("users")} className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500">
                      <tr>
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Email</th>
                        <th className="p-4 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {loading ? (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading...</td></tr>
                      ) : recentUsers.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-400">No users yet</td></tr>
                      ) : recentUsers.map((u) => (
                        <tr key={u.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                                {u.name[0].toUpperCase()}
                              </div>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="p-4 capitalize text-slate-600 dark:text-slate-400">{u.role}</td>
                          <td className="p-4 text-slate-500">{u.email}</td>
                          <td className="p-4 text-slate-500">{timeAgo(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Total Users", value: allUsers.length, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Students", value: allUsers.filter(u => u.role === "student").length, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Teachers", value: allUsers.filter(u => u.role === "teacher").length, color: "text-purple-500", bg: "bg-purple-500/10" },
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                      <Users size={24} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{loading ? "—" : stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-lg">All Users</h3>
                  <div className="flex gap-2">
                    {["all", "student", "teacher"].map(f => (
                      <button key={f} onClick={() => setUserFilter(f)}
                        className={`px-3 py-1 text-sm rounded-lg capitalize font-medium ${userFilter === f ? "bg-emerald-500 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500">
                      <tr>
                        <th className="p-4 font-medium">User</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Email</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Joined</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading...</td></tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-400">No users found</td></tr>
                      ) : filteredUsers.map((u) => (
                        <tr key={u.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                                {u.name[0].toUpperCase()}
                              </div>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="p-4 capitalize text-slate-600 dark:text-slate-400">{u.role}</td>
                          <td className="p-4 text-slate-500">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.isBlocked ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                              {u.isBlocked ? "Blocked" : "Active"}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">{timeAgo(u.createdAt)}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button onClick={() => toggleBlock(u.id, u.isBlocked)}
                                className={`font-medium text-xs hover:underline ${u.isBlocked ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                {u.isBlocked ? "Unblock" : "Block"}
                              </button>
                              <button onClick={() => deleteUser(u.id)} className="text-red-500 font-medium text-xs hover:underline">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "payments" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-bold">Payments & Subscriptions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}` },
                  { label: "Total Transactions", value: payments.length.toString() },
                  { label: "Course Purchases", value: payments.filter(p => p.paymentType === "course").length.toString() },
                ].map((s, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{s.label}</p>
                    <p className="text-3xl font-black">{loading ? "—" : s.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-lg">Recent Transactions</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500">
                      <tr>
                        <th className="p-4 font-medium">User</th>
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Course</th>
                        <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading...</td></tr>
                      ) : payments.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-400">No transactions yet</td></tr>
                      ) : payments.map((p) => (
                        <tr key={p.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          <td className="p-4">
                            <p className="font-medium">{p.userName}</p>
                            <p className="text-xs text-slate-500">{p.userEmail}</p>
                          </td>
                          <td className="p-4 capitalize text-slate-600 dark:text-slate-400">{p.paymentType}</td>
                          <td className="p-4 text-slate-500">{p.courseTitle ?? p.subscriptionPlan ?? "—"}</td>
                          <td className="p-4 font-medium text-emerald-600">₹{p.amount}</td>
                          <td className="p-4 text-slate-500">{timeAgo(p.createdAt)}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-bold">Platform Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}` },
                  { label: "Total Students", value: stats.totalStudents.toLocaleString() },
                  { label: "Total Teachers", value: stats.totalTeachers.toLocaleString() },
                  { label: "Total Courses", value: stats.totalCourses.toLocaleString() },
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{stat.label}</p>
                    <p className="text-3xl font-black">{loading ? "—" : stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "activity" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-bold">System Activity</h2>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-lg">Recent Registrations</h3>
                </div>
                <div className="p-6 space-y-4">
                  {loading ? <p className="text-slate-400 text-sm">Loading...</p> :
                    allUsers.slice(0, 10).length === 0 ? <p className="text-slate-400 text-sm">No activity yet</p> :
                    allUsers.slice(0, 10).map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div>
                            <p className="font-medium text-sm">New {u.role} registered</p>
                            <p className="text-xs text-slate-500">{u.name} · {u.email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">{timeAgo(u.createdAt)}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </motion.div>
          )}


        </div>
      </main>
    </div>
  );
}
