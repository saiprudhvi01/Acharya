"use client";

import { motion } from "framer-motion";
import { Award, Bell, Book, Calendar, CheckCircle2, CreditCard, GraduationCap, LayoutDashboard, LogOut, PlayCircle, Star, TrendingUp, User } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import RazorpayButton from "@/components/RazorpayButton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hasSub, setHasSub] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== "student") {
      router.push("/login");
      return;
    }
  }, [router]);

  return (
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
            <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                JD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">John Doe</p>
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
                  { label: "Active Courses", value: "0", icon: Book, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Attendance", value: "N/A", icon: User, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Certificates", value: "0", icon: Star, color: "text-orange-500", bg: "bg-orange-500/10" }
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: "Advanced React Patterns", teacher: "Sarah Drasner", price: "Premium", rating: 4.9 },
                  { title: "Machine Learning A-Z", teacher: "Andrew Ng", price: "Standard", rating: 4.8 },
                  { title: "UI/UX Design Masterclass", teacher: "Gary Simon", price: "Basic", rating: 4.7 }
                ].map((course, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="h-48 bg-slate-200 dark:bg-slate-800 relative">
                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Star size={12} className="fill-current" /> {course.rating}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">by {course.teacher}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{course.price} Required</span>
                        <button onClick={() => setActiveTab("subscription")} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-medium hover:opacity-90">
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                <PlayCircle className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">No active courses</h3>
                <p className="text-slate-500 mb-6">You haven't enrolled in any courses yet.</p>
                <button onClick={() => setActiveTab("marketplace")} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium">Browse Marketplace</button>
              </div>
            </motion.div>
          )}

          {activeTab === "schedule" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <h2 className="text-2xl font-bold mb-6">Upcoming Classes</h2>
               <div className="space-y-4">
                 {[1,2].map((i) => (
                   <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex flex-col items-center justify-center text-purple-600 dark:text-purple-400">
                          <span className="font-bold text-lg">Oct</span>
                          <span className="font-bold text-xl">{14 + i}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">Advanced Web Dev</h4>
                          <p className="text-slate-500 text-sm flex items-center gap-1">10:00 AM • Prof. Sarah</p>
                        </div>
                     </div>
                     <button className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium hover:opacity-90">
                       Join Class
                     </button>
                   </div>
                 ))}
               </div>
            </motion.div>
          )}

          {activeTab === "progress" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
               
               {/* Overall Stats */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: "Courses Enrolled", value: "3", icon: Book, color: "text-blue-500", bg: "bg-blue-500/10" },
                   { label: "Assignments Done", value: "8/12", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                   { label: "Attendance Rate", value: "92%", icon: User, color: "text-purple-500", bg: "bg-purple-500/10" },
                   { label: "Certificates", value: "1", icon: Star, color: "text-orange-500", bg: "bg-orange-500/10" }
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

               {/* Course Progress */}
               <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                 <h3 className="font-bold text-lg mb-6">Course Progress</h3>
                 <div className="space-y-6">
                   {[
                     { title: "Advanced Web Development", progress: 75 },
                     { title: "Machine Learning Basics", progress: 45 },
                     { title: "UI/UX Design Masterclass", progress: 90 }
                   ].map((course, i) => (
                     <div key={i}>
                       <div className="flex items-center justify-between mb-2">
                         <span className="font-medium">{course.title}</span>
                         <span className="text-sm text-slate-500">{course.progress}%</span>
                       </div>
                       <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                           style={{ width: `${course.progress}%` }}
                         />
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Assignment Scores */}
               <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                 <h3 className="font-bold text-lg mb-6">Recent Assignment Scores</h3>
                 <div className="space-y-4">
                   {[
                     { title: "React Hooks Assignment", score: 95, max: 100 },
                     { title: "ML Model Training", score: 88, max: 100 },
                     { title: "Design System Project", score: 92, max: 100 }
                   ].map((assignment, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                       <div>
                         <p className="font-medium">{assignment.title}</p>
                         <p className="text-sm text-slate-500">Submitted 2 days ago</p>
                       </div>
                       <div className="text-right">
                         <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{assignment.score}/{assignment.max}</p>
                         <p className="text-xs text-emerald-500 font-medium">Excellent</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </motion.div>
          )}

          {activeTab === "certificates" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <h2 className="text-2xl font-bold mb-6">Your Certificates</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   { 
                     title: "Advanced Web Development", 
                     date: "October 15, 2024",
                     id: "CERT-2024-ABC123",
                     teacher: "Prof. Sarah Drasner"
                   },
                   { 
                     title: "UI/UX Design Masterclass", 
                     date: "September 28, 2024",
                     id: "CERT-2024-XYZ789",
                     teacher: "Prof. Gary Simon"
                   }
                 ].map((cert, i) => (
                   <div key={i} className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                     <div className="flex items-start justify-between mb-4">
                       <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
                         <Award className="text-amber-600 dark:text-amber-400" size={24} />
                       </div>
                       <span className="text-xs text-slate-500 font-mono">{cert.id}</span>
                     </div>
                     <h3 className="font-bold text-lg mb-1">{cert.title}</h3>
                     <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Instructor: {cert.teacher}</p>
                     <p className="text-xs text-slate-500">Completed: {cert.date}</p>
                     <div className="mt-4 flex gap-2">
                       <button className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                         View Certificate
                       </button>
                       <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                         Download
                       </button>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                 <Award className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                 <h3 className="font-bold text-lg mb-2">Earn More Certificates</h3>
                 <p className="text-slate-600 dark:text-slate-400 mb-4">Complete courses to earn certificates and showcase your achievements.</p>
                 <button onClick={() => setActiveTab("marketplace")} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                   Browse Courses
                 </button>
               </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
