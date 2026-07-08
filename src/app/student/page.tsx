"use client";

import { motion } from "framer-motion";
import { Award, Bell, Book, Calendar, CheckCircle2, CreditCard, GraduationCap, LayoutDashboard, LogOut, PlayCircle, Star, TrendingUp, User } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import RazorpayButton from "@/components/RazorpayButton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function CertificatesTab({ token, onBrowse }: { token: string | null; onBrowse: () => void }) {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/certificates/generate", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setCertificates(d.certificates ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-slate-400 text-sm text-center py-8">Loading...</p>;

  if (certificates.length === 0) return (
    <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
      <Award className="w-16 h-16 mx-auto text-slate-300 mb-4" />
      <h3 className="font-bold text-lg mb-2">No certificates yet</h3>
      <p className="text-slate-500 mb-4">Your teacher will upload your certificate once you complete a course.</p>
      <button onClick={onBrowse} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">Browse Courses</button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {certificates.map((cert, i) => (
        <div key={i} className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
              <Award className="text-amber-600 dark:text-amber-400" size={24} />
            </div>
            <span className="text-xs text-slate-400">{new Date(cert.issuedAt).toLocaleDateString()}</span>
          </div>
          <h3 className="font-bold text-lg mb-1">{cert.courseTitle}</h3>
          <p className="text-sm text-slate-500 mb-4">Issued by {cert.teacherName}</p>
          <a
            href={cert.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            📄 View Certificate
          </a>
        </div>
      ))}
    </div>
  );
}

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hasSub, setHasSub] = useState(false);
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseMaterials, setCourseMaterials] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [payingCourse, setPayingCourse] = useState<any>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) { router.push("/login"); return; }

    const parsed = JSON.parse(userData);
    if (parsed.role !== "student") { router.push("/login"); return; }
    setUser(parsed);

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch marketplace courses
    fetch("/api/courses", { headers })
      .then(r => r.json())
      .then(d => setCourses(d.courses ?? []))
      .catch(console.error);

    // Fetch notifications
    fetch("/api/notifications", { headers })
      .then(r => r.json())
      .then(d => {
        const notifs = d.notifications ?? [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
      })
      .catch(console.error);

    // Fetch enrolled courses + progress
    Promise.all([
      fetch("/api/user/profile", { headers }).then(r => r.json()),
      fetch("/api/student/progress", { headers }).then(r => r.json()),
    ]).then(([profileData, progressData]) => {
      setEnrolledCourses(profileData.user?.enrolledCourses ?? []);
      setProgress(progressData);
    }).catch(console.error);
  }, [router]);

  const refreshEnrolled = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const [profileData, progressData] = await Promise.all([
      fetch("/api/user/profile", { headers }).then(r => r.json()),
      fetch("/api/student/progress", { headers }).then(r => r.json()),
    ]);
    setEnrolledCourses(profileData.user?.enrolledCourses ?? []);
    setProgress(progressData);
  };

  const handleEnroll = async (course: any) => {
    setPayingCourse(course);
    setPaymentDone(false);
  };

  const handlePayAndEnroll = async () => {
    if (!payingCourse) return;
    setEnrolling(payingCourse.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: payingCourse.id }),
      });
      if (res.ok) {
        setPaymentDone(true);
        await refreshEnrolled();
        setTimeout(() => {
          setPayingCourse(null);
          setPaymentDone(false);
          setActiveTab("courses");
        }, 1500);
      }
    } finally {
      setEnrolling(null);
    }
  };

  const openCourse = async (course: any) => {
    setSelectedCourse(course);
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/courses/materials?courseId=${course.id}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setCourseMaterials(data.materials ?? []);
  };

  const handleBellClick = async () => {
    setShowNotifications(v => !v);
    if (unreadCount > 0) {
      const token = localStorage.getItem("token");
      await fetch("/api/notifications/mark-all-read", { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      setNotifications(n => n.map(x => ({ ...x, isRead: true })));
      setUnreadCount(0);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex flex-col fixed h-full z-40 relative hidden md:flex">
        <div className="p-6 flex items-center gap-2">
          <Book className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Acharya</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "courses", icon: PlayCircle, label: "My Courses" },
            { id: "marketplace", icon: Book, label: "Marketplace" },
            { id: "schedule", icon: Calendar, label: "Live Classes" },
            { id: "progress", icon: TrendingUp, label: "Progress" },
            { id: "certificates", icon: Award, label: "Certificates" },
            { id: "subscription", icon: CreditCard, label: "Subscription" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium" 
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
      <main className="flex-1 flex flex-col md:ml-0 h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
          <h1 className="text-xl font-semibold capitalize">{activeTab.replace("-", " ")}</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{unreadCount}</span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">&times;</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">No notifications yet</p>
                    ) : notifications.map((n, i) => (
                      <div key={i} className={`p-4 border-b border-slate-50 dark:border-slate-800 last:border-0 ${
                        !n.isRead ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''
                      }`}>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                {user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name || ""}</p>
                <p className="text-xs text-slate-500">Student</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8">
          {activeTab === "dashboard" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Welcome Banner */}
              <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
                  <p className="text-indigo-100 max-w-lg mb-6">Start your learning journey today. Explore courses and track your progress.</p>
                  <button onClick={() => setActiveTab("marketplace")} className="px-6 py-2 bg-white text-indigo-600 rounded-full font-medium hover:scale-105 transition-transform shadow-lg">
                    Browse Courses
                  </button>
                </div>
                <GraduationCap className="absolute -bottom-8 -right-8 w-64 h-64 text-white/10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Active Courses", value: enrolledCourses.length.toString(), icon: Book, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Attendance", value: progress?.overallAttendance ? `${progress.overallAttendance}%` : "N/A", icon: User, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Assignments Done", value: progress ? `${progress.completedAssignments}/${progress.totalAssignments}` : "0", icon: Star, color: "text-orange-500", bg: "bg-orange-500/10" }
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                      <stat.icon size={28} />
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "marketplace" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className="text-2xl font-bold">Available Courses</h2>
              {courses.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <Book className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No courses available yet</h3>
                  <p className="text-slate-500">Check back once teachers publish their courses.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course, i) => {
                    const isEnrolled = enrolledCourses.some((e: any) => e.id === course.id);
                    return (
                      <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                          <span className="text-5xl">{course.skillLevel === 'beginner' ? '📄' : course.skillLevel === 'intermediate' ? '🎥' : '🔴'}</span>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold">{course.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                              course.skillLevel === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : course.skillLevel === 'intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>{course.skillLevel}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">by {course.teacherName}</p>
                          <p className="text-xs text-slate-400 mb-4">
                            {course.skillLevel === 'beginner' ? '📄 PDF materials' : course.skillLevel === 'intermediate' ? '🎥 Video lessons' : '🔴 Live classes'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{course.price}</span>
                            {isEnrolled ? (
                              <button onClick={() => { openCourse(course); setActiveTab('courses'); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                                Open Course
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEnroll(course)}
                                disabled={enrolling === course.id}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
                              >
                                {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "subscription" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Choose Your Journey</h2>
                <p className="text-slate-500 flex justify-center">Unlock unlimited learning with our premium subscriptions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                {[
                  { name: "Basic", price: 1000, duration: "1 Month", features: ["Access to Basic courses", "Community support", "Standard certificates"] },
                  { name: "Standard", price: 2000, duration: "2 Months", features: ["Access to Standard courses", "Live Q&A support", "Verified certificates", "Downloadable resources"], featured: true },
                  { name: "Premium", price: 10000, duration: "1 Year", features: ["Access to ALL courses", "1-on-1 mentorship", "Premium certificates", "Job assistance", "Offline mode"] }
                ].map((plan, i) => (
                  <div key={i} className={`relative p-8 rounded-3xl border bg-white dark:bg-slate-900 flex flex-col ${plan.featured ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105 z-10' : 'border-slate-200 dark:border-slate-800'}`}>
                    {plan.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-4 mb-6 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold">₹{plan.price}</span>
                      <span className="text-slate-500">/ {plan.duration}</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <RazorpayButton amount={plan.price} onSuccess={() => setHasSub(true)} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "courses" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {!selectedCourse ? (
                <>
                  <h2 className="text-2xl font-bold">My Courses</h2>
                  {enrolledCourses.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                      <PlayCircle className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                      <h3 className="text-xl font-bold mb-2">No active courses</h3>
                      <p className="text-slate-500 mb-6">You haven't enrolled in any courses yet.</p>
                      <button onClick={() => setActiveTab("marketplace")} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium">Browse Marketplace</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {enrolledCourses.map((course, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{course.skillLevel === 'beginner' ? '📄' : course.skillLevel === 'intermediate' ? '🎥' : '🔴'}</span>
                            <div>
                              <h3 className="font-bold text-lg">{course.title}</h3>
                              <p className="text-sm text-slate-500">by {course.teacherName}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mb-4 capitalize">
                            {course.skillLevel === 'beginner' ? '📄 PDF materials' : course.skillLevel === 'intermediate' ? '🎥 Video lessons' : '🔴 Live classes'}
                          </p>
                          <button onClick={() => openCourse(course)} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">Open Course</button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedCourse(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
                      ← Back
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                      <p className="text-sm text-slate-500">by {selectedCourse.teacherName}</p>
                    </div>
                  </div>

                  {courseMaterials.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                      <span className="text-5xl block mb-4">{selectedCourse.skillLevel === 'beginner' ? '📄' : selectedCourse.skillLevel === 'intermediate' ? '🎥' : '🔴'}</span>
                      <h3 className="text-xl font-bold mb-2">No content yet</h3>
                      <p className="text-slate-500">Your teacher hasn't uploaded any {selectedCourse.skillLevel === 'beginner' ? 'PDFs' : selectedCourse.skillLevel === 'intermediate' ? 'videos' : 'live class links'} yet. Check back soon.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courseMaterials.map((m, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{m.type === 'pdf' ? '📄' : m.type === 'video' ? '🎥' : '🔴'}</span>
                            <div>
                              <p className="font-semibold">{m.title}</p>
                              <p className="text-xs text-slate-500 capitalize">{m.type === 'live' ? 'Live Class' : m.type}</p>
                            </div>
                          </div>
                          {m.type === 'live' ? (
                            <a href={m.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">
                              🔴 Join Live
                            </a>
                          ) : (
                            <a href={m.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                              {m.type === 'pdf' ? '📅 View PDF' : '▶️ Watch'}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {activeTab === "schedule" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <h2 className="text-2xl font-bold mb-6">Upcoming Classes</h2>
               <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                 <Calendar className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                 <h3 className="text-xl font-bold mb-2">No upcoming classes</h3>
                 <p className="text-slate-500">Your teacher hasn't scheduled any live classes yet.</p>
               </div>
            </motion.div>
          )}

          {activeTab === "progress" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <h2 className="text-2xl font-bold mb-6">Your Progress</h2>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: "Courses Enrolled", value: (progress?.totalCourses ?? 0).toString(), icon: Book, color: "text-blue-500", bg: "bg-blue-500/10" },
                   { label: "Assignments Done", value: progress ? `${progress.completedAssignments}/${progress.totalAssignments}` : "0/0", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                   { label: "Attendance Rate", value: progress?.overallAttendance ? `${progress.overallAttendance}%` : "N/A", icon: User, color: "text-purple-500", bg: "bg-purple-500/10" },
                 ].map((stat, i) => (
                   <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                       <stat.icon size={24} />
                     </div>
                     <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{stat.label}</p>
                     <p className="text-2xl font-bold">{stat.value}</p>
                   </div>
                 ))}
               </div>

               {/* Assignments */}
               <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                 <h3 className="font-bold text-lg mb-6">Assignments</h3>
                 {progress?.assignmentProgress?.length === 0 || !progress?.assignmentProgress ? (
                   <p className="text-slate-400 text-sm text-center py-4">No assignments yet</p>
                 ) : (
                   <div className="space-y-4">
                     {progress.assignmentProgress.map((a: any, i: number) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                         <div>
                           <p className="font-medium">{a.title}</p>
                           <p className="text-sm text-slate-500">{a.courseTitle}</p>
                         </div>
                         <div className="text-right">
                           {a.submitted ? (
                             <>
                               <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{a.marks ?? "—"}/{a.maxMarks}</p>
                               <p className="text-xs text-emerald-500 font-medium">Submitted</p>
                             </>
                           ) : (
                             <span className="px-2 py-1 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-medium">Pending</span>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </motion.div>
          )}

          {activeTab === "certificates" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <h2 className="text-2xl font-bold mb-6">Your Certificates</h2>
               <CertificatesTab token={typeof window !== 'undefined' ? localStorage.getItem('token') : ''} onBrowse={() => setActiveTab('marketplace')} />
            </motion.div>
          )}

        </div>
      </main>
    </div>

      {/* Payment Modal */}
      {payingCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            {paymentDone ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-emerald-500" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Payment Successful!</h3>
                <p className="text-slate-500">You are now enrolled in <span className="font-semibold text-indigo-600">{payingCourse.title}</span></p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-1">Complete Payment</h2>
                <p className="text-slate-500 text-sm mb-6">You are enrolling in:</p>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{payingCourse.skillLevel === 'beginner' ? '📄' : payingCourse.skillLevel === 'intermediate' ? '🎥' : '🔴'}</span>
                    <div>
                      <p className="font-bold">{payingCourse.title}</p>
                      <p className="text-sm text-slate-500">by {payingCourse.teacherName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 capitalize">{payingCourse.skillLevel} level</span>
                    <span className="text-2xl font-bold text-indigo-600">₹{payingCourse.price}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handlePayAndEnroll}
                    disabled={enrolling === payingCourse.id}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    {enrolling === payingCourse.id ? 'Processing...' : `Pay ₹${payingCourse.price} & Enroll`}
                  </button>
                  <button
                    onClick={() => setPayingCourse(null)}
                    className="w-full py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
