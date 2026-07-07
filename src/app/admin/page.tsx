"use client";

import { motion } from "framer-motion";
import { Activity, BarChart3, CreditCard, LayoutDashboard, LogOut, Settings, ShieldAlert, Users, Video } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "admin") {
      router.push("/login");
      return;
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black text-slate-300 flex flex-col fixed h-full z-40 relative hidden md:flex">
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
            { id: "settings", icon: Settings, label: "Configuration" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                activeTab === item.id 
                  ? "bg-emerald-500 text-white" 
                  : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Exit Console
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-xl font-bold capitalize">{activeTab.replace("-", " ")}</h1>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                SA
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold">Super Admin</p>
                <p className="text-xs text-slate-500">System Owner</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Revenue", value: "₹24M", change: "+14%", positive: true },
                  { label: "Active Subscriptions", value: "12,405", change: "+5%", positive: true },
                  { label: "Total Students", value: "48.2K", change: "+12%", positive: true },
                  { label: "Total Teachers", value: "1,204", change: "+2%", positive: true },
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{stat.label}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-black">{stat.value}</p>
                      <span className={`text-sm font-medium ${stat.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-lg">Recent User Registrations</h3>
                  <button className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500">
                      <tr>
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Joined</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <tr key={i} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/20">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                              <span className="font-medium">User {i+1}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-400">{i % 2 === 0 ? 'Student' : 'Teacher'}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                              Active
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">2 mins ago</td>
                          <td className="p-4">
                            <button className="text-indigo-600 dark:text-indigo-400 font-medium text-xs hover:underline">Review</button>
                          </td>
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
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                    Add New User
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Total Users", value: "49,609", color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Active Students", value: "48,205", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Active Teachers", value: "1,204", color: "text-purple-500", bg: "bg-purple-500/10" }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                        <Users size={24} />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg">All Users</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg font-medium">All</button>
                      <button className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Students</button>
                      <button className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Teachers</button>
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
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <tr key={i} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/20">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <span className="font-medium">User {i+1}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600 dark:text-slate-400">{i % 2 === 0 ? 'Student' : 'Teacher'}</td>
                            <td className="p-4 text-slate-500">user{i+1}@email.com</td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                Active
                              </span>
                            </td>
                            <td className="p-4 text-slate-500">Oct {i+1}, 2024</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button className="text-indigo-600 dark:text-indigo-400 font-medium text-xs hover:underline">Edit</button>
                                <button className="text-red-500 font-medium text-xs hover:underline">Delete</button>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Revenue", value: "₹24M", change: "+14%", positive: true },
                    { label: "This Month", value: "₹2.4M", change: "+8%", positive: true },
                    { label: "Pending Payouts", value: "₹45K", change: "-2%", positive: false },
                    { label: "Refunds", value: "₹12K", change: "+1%", positive: false }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{stat.label}</p>
                      <div className="flex items-end justify-between">
                        <p className="text-3xl font-black">{stat.value}</p>
                        <span className={`text-sm font-medium ${stat.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                          {stat.change}
                        </span>
                      </div>
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
                          <th className="p-4 font-medium">Transaction ID</th>
                          <th className="p-4 font-medium">User</th>
                          <th className="p-4 font-medium">Type</th>
                          <th className="p-4 font-medium">Amount</th>
                          <th className="p-4 font-medium">Date</th>
                          <th className="p-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <tr key={i} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/20">
                            <td className="p-4 font-mono text-xs text-slate-500">TXN{1000 + i}</td>
                            <td className="p-4 font-medium">User {i+1}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-400">{i % 2 === 0 ? 'Subscription' : 'Course Purchase'}</td>
                            <td className="p-4 font-medium text-emerald-600">₹{1000 + i * 500}</td>
                            <td className="p-4 text-slate-500">Oct {10 + i}, 2024</td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                Completed
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

          {activeTab === "activity" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-bold">System Activity</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Active Sessions", value: "1,245", color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "API Requests (24h)", value: "45.2K", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Server Load", value: "42%", color: "text-orange-500", bg: "bg-orange-500/10" }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                        <Activity size={24} />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Recent Activity Log</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { action: "New user registration", user: "User 123", time: "2 mins ago", type: "success" },
                      { action: "Course purchase completed", user: "User 456", time: "5 mins ago", type: "success" },
                      { action: "Teacher payout processed", user: "Prof. Turing", time: "15 mins ago", type: "info" },
                      { action: "Failed login attempt", user: "Unknown", time: "1 hour ago", type: "error" },
                      { action: "System backup completed", user: "System", time: "2 hours ago", type: "success" }
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
                          <div>
                            <p className="font-medium text-sm">{log.action}</p>
                            <p className="text-xs text-slate-500">by {log.user}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
             </motion.div>
          )}

          {activeTab === "analytics" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Platform Analytics</h2>
                
                {/* Time Period Selector */}
                <div className="flex gap-2">
                  {['7', '30', '90'].map((days) => (
                    <button key={days} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      Last {days} days
                    </button>
                  ))}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Revenue", value: "₹24.5M", change: "+14%", positive: true },
                    { label: "New Users", value: "2,847", change: "+23%", positive: true },
                    { label: "Active Courses", value: "156", change: "+8%", positive: true },
                    { label: "Completion Rate", value: "78%", change: "+5%", positive: true }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">{stat.label}</p>
                      <div className="flex items-end justify-between">
                        <p className="text-3xl font-black">{stat.value}</p>
                        <span className={`text-sm font-medium ${stat.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Registrations Chart */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6">User Registrations</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {[65, 80, 45, 90, 75, 110, 95, 120, 85, 140, 105, 130].map((value, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80"
                            style={{ height: `${value}%` }}
                          />
                          <span className="text-xs text-slate-500">{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6">Revenue Trend</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {[45, 60, 55, 80, 70, 95, 85, 110, 100, 125, 115, 140].map((value, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t-lg transition-all hover:opacity-80"
                            style={{ height: `${value}%` }}
                          />
                          <span className="text-xs text-slate-500">{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Course Popularity */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-lg mb-6">Top Courses by Enrollment</h3>
                  <div className="space-y-4">
                    {[
                      { title: "Advanced Web Development", students: 1234, percentage: 85 },
                      { title: "Machine Learning A-Z", students: 987, percentage: 72 },
                      { title: "UI/UX Design Masterclass", students: 856, percentage: 65 },
                      { title: "Python for Data Science", students: 743, percentage: 58 },
                      { title: "React & Next.js Full Stack", students: 621, percentage: 52 }
                    ].map((course, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{course.title}</span>
                          <span className="text-sm text-slate-500">{course.students} students</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: `${course.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscription Distribution */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-lg mb-6">Subscription Distribution</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { plan: "Basic", count: 2450, percentage: 35, color: "bg-blue-500" },
                      { plan: "Standard", count: 3200, percentage: 45, color: "bg-purple-500" },
                      { plan: "Premium", count: 1350, percentage: 20, color: "bg-amber-500" }
                    ].map((sub, i) => (
                      <div key={i} className="text-center">
                        <div className={`w-32 h-32 mx-auto rounded-full ${sub.color} flex items-center justify-center mb-4`}>
                          <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold">{sub.percentage}%</span>
                          </div>
                        </div>
                        <h4 className="font-bold">{sub.plan}</h4>
                        <p className="text-sm text-slate-500">{sub.count} subscribers</p>
                      </div>
                    ))}
                  </div>
                </div>
             </motion.div>
          )}

          {activeTab === "settings" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-bold">Platform Configuration</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6">General Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Maintenance Mode</p>
                          <p className="text-xs text-slate-500">Disable platform for maintenance</p>
                        </div>
                        <button className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                          <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">User Registration</p>
                          <p className="text-xs text-slate-500">Allow new user signups</p>
                        </div>
                        <button className="w-12 h-6 bg-emerald-500 rounded-full relative">
                          <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Email Notifications</p>
                          <p className="text-xs text-slate-500">Send system emails</p>
                        </div>
                        <button className="w-12 h-6 bg-emerald-500 rounded-full relative">
                          <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg mb-6">Payment Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Razorpay Key ID</label>
                        <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" placeholder="rzp_live_..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                        <input type="number" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" placeholder="15" />
                      </div>
                      <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
             </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
