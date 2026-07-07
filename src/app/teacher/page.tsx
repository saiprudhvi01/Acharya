"use client";

import { motion } from "framer-motion";
import { BookPlus, CheckCircle2, Copy, IndianRupee, LayoutDashboard, Link2, LogOut, MessageSquare, Plus, Star, Users, Video } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [meetingUrl, setMeetingUrl] = useState("");

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "teacher") {
      router.push("/login");
      return;
    }
  }, [router]);

  const handleGenerateLink = () => {
    setMeetingUrl(`https://meet.acharya.edu/class-${Math.random().toString(36).substr(2, 6)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex flex-col fixed h-full z-40 relative hidden md:flex">
        <div className="p-6 flex items-center gap-2">
          <BookPlus className="text-purple-600 dark:text-purple-400 w-8 h-8" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Acharya Educator</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "courses", icon: BookPlus, label: "Manage Courses" },
            { id: "live", icon: Video, label: "Live Classes" },
            { id: "students", icon: Users, label: "Students" },
            { id: "messages", icon: MessageSquare, label: "Messages" },
            { id: "earnings", icon: IndianRupee, label: "Earnings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-xl font-semibold capitalize">{activeTab.replace("-", " ")}</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                PT
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">Prof. Turing</p>
                <p className="text-xs text-slate-500">Computer Science</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 w-full max-w-6xl mx-auto">
          {activeTab === "dashboard" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Students", value: "842", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Active Courses", value: "4", icon: BookPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Pending Assignments", value: "28", icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-500/10" },
                  { label: "Revenue", value: "₹45.2K", icon: IndianRupee, color: "text-purple-500", bg: "bg-purple-500/10" }
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                      <stat.icon size={24} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-[400px]">
                  <h3 className="font-bold text-lg mb-6">Recent Enrolments</h3>
                  <div className="space-y-4">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                           <div>
                             <p className="font-medium text-sm">Student Name {i}</p>
                             <p className="text-xs text-slate-500">Purchased Data Analytics (Premium)</p>
                           </div>
                         </div>
                         <span className="text-emerald-500 font-medium text-sm">+ ₹2,500</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-[400px]">
                  <h3 className="font-bold text-lg mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setActiveTab("live")} className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-200/50 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                      <Video className="w-8 h-8 text-purple-600" />
                      <span className="font-medium text-purple-900 dark:text-purple-300">Start Class</span>
                    </button>
                    <button onClick={() => setActiveTab("courses")} className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                      <Plus className="w-8 h-8 text-emerald-600" />
                      <span className="font-medium text-emerald-900 dark:text-emerald-300">New Course</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "live" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Video size={40} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Host a Live Session</h2>
                  <p className="text-slate-500 mb-8 max-w-sm mx-auto">Generate a secure meeting link and notify your students instantly.</p>
                  
                  {!meetingUrl ? (
                    <button onClick={handleGenerateLink} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium flex items-center gap-2 mx-auto transition-colors">
                      <Link2 size={20} /> Generate Meeting Link
                    </button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in w-full max-w-md mx-auto">
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
                        <span className="font-mono text-sm text-purple-600 dark:text-purple-400 truncate mr-4">{meetingUrl}</span>
                        <button className="p-2 bg-white dark:bg-slate-700 rounded-lg hover:shadow-md transition-shadow">
                          <Copy size={16} />
                        </button>
                      </div>
                      <button className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium focus:ring-4 focus:ring-purple-500/20 transition-all shadow-lg shadow-purple-500/20">
                        Send Notification to Students
                      </button>
                    </div>
                  )}
                </div>
             </motion.div>
          )}

          {activeTab === "courses" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">My Courses</h2>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-purple-700 transition-colors">
                    <Plus size={18} /> Create Course
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: "Advanced Web Development", students: 234, rating: 4.8, status: "Active" },
                    { title: "Data Analytics Fundamentals", students: 156, rating: 4.9, status: "Active" },
                    { title: "Machine Learning Basics", students: 89, rating: 4.7, status: "Draft" },
                    { title: "UI/UX Design Principles", students: 312, rating: 4.6, status: "Active" }
                  ].map((course, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-bold text-lg">{course.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                          {course.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Users size={16} /> {course.students} students</span>
                        <span className="flex items-center gap-1"><Star size={16} className="fill-current text-yellow-500" /> {course.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
             </motion.div>
          )}

          {activeTab === "students" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-bold">My Students</h2>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500">
                        <tr>
                          <th className="p-4 font-medium">Student</th>
                          <th className="p-4 font-medium">Course</th>
                          <th className="p-4 font-medium">Progress</th>
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <tr key={i} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/20">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <div>
                                  <p className="font-medium">Student {i+1}</p>
                                  <p className="text-xs text-slate-500">student{i+1}@email.com</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600 dark:text-slate-400">Advanced Web Development</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${60 + i * 8}%` }} />
                                </div>
                                <span className="text-xs font-medium">{60 + i * 8}%</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                Active
                              </span>
                            </td>
                            <td className="p-4">
                              <button className="text-purple-600 dark:text-purple-400 font-medium text-xs hover:underline">View Profile</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
             </motion.div>
          )}

          {activeTab === "messages" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-bold">Messages</h2>
                <div className="space-y-4">
                  {[
                    { name: "Alice Johnson", message: "Can you clarify the concept of React hooks?", time: "2 hours ago", unread: true },
                    { name: "Bob Smith", message: "Thank you for the great lecture on ML!", time: "5 hours ago", unread: false },
                    { name: "Carol Davis", message: "When is the next assignment due?", time: "1 day ago", unread: false }
                  ].map((msg, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ${msg.unread ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'} hover:shadow-md transition-shadow cursor-pointer`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                          <span className="font-medium">{msg.name}</span>
                          {msg.unread && <span className="w-2 h-2 bg-purple-500 rounded-full" />}
                        </div>
                        <span className="text-xs text-slate-500">{msg.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{msg.message}</p>
                    </div>
                  ))}
                </div>
             </motion.div>
          )}

          {activeTab === "earnings" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-emerald-50 mb-1">Total Earnings</h2>
                    <p className="text-5xl font-bold">₹1,45,200</p>
                  </div>
                  <button className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-medium shadow-xl hover:scale-105 transition-transform">
                    Request Payout
                  </button>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-lg">Recent Transactions</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-sm text-slate-500">
                        <tr>
                          <th className="p-4 font-medium">Date</th>
                          <th className="p-4 font-medium">Course</th>
                          <th className="p-4 font-medium">Student</th>
                          <th className="p-4 font-medium">Amount</th>
                          <th className="p-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                          <tr key={i} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/20">
                            <td className="p-4 text-slate-500">Oct {10 + i}, 2024</td>
                            <td className="p-4 font-medium">Advanced Web Development</td>
                            <td className="p-4 text-slate-600 dark:text-slate-400">Student {i+1}</td>
                            <td className="p-4 font-medium text-emerald-600">+ ₹2,500</td>
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
        </div>
      </main>
    </div>
  );
}
