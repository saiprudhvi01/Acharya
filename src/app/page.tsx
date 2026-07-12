"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowRight, BookOpen, GraduationCap, LayoutDashboard, ShieldCheck, LogOut } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Redirect to appropriate dashboard
      const redirectPath = parsedUser.role === "student" ? "/student" : 
                          parsedUser.role === "teacher" ? "/teacher" : "/admin";
      window.location.href = redirectPath;
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Background Images */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5 dark:opacity-10" 
             style={{ backgroundImage: 'url(/bgimages/74d93df2-38cf-4960-ab43-a338f9e0db26.jpeg)' }} />
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-0 dark:opacity-8" 
             style={{ backgroundImage: 'url(/bgimages/e8c3a632-02b6-4bd6-8ef5-6407dde96335.jpeg)' }} />
      </div>

      {/* Gradient Overlays for better text contrast */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-50/97 via-slate-50/95 to-slate-50/97 dark:from-slate-950/97 dark:via-slate-950/95 dark:to-slate-950/97 pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Acharya
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              Sign Up
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6 max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            The Future of <span className="text-indigo-600 dark:text-indigo-400">Intelligent</span> Learning
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Acharya connects students, teachers, and administrators into one seamless, modern educational ecosystem.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
        >
          {/* Student Card */}
          <Link href="/register?role=student" className="group">
            <div className="p-8 rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-sm hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-2xl font-semibold">Student Portal</h2>
              <p className="text-slate-500 dark:text-slate-400">Browse courses, attend live classes, and track your progress.</p>
              <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Get Started <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </Link>

          {/* Teacher Card */}
          <Link href="/register?role=teacher" className="group">
            <div className="p-8 rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-sm hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <LayoutDashboard size={32} />
              </div>
              <h2 className="text-2xl font-semibold">Teacher Portal</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage courses, monitor students, and host live classes.</p>
              <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Get Started <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </Link>

          {/* Admin Card */}
          <Link href="/login" className="group">
            <div className="p-8 rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 backdrop-blur-sm hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-semibold">Admin Portal</h2>
              <p className="text-slate-500 dark:text-slate-400">Full system oversight, analytics, and platform configuration.</p>
              <div className="mt-4 flex items-center text-emerald-600 dark:text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Login <ArrowRight size={16} className="ml-2" />
              </div>
            </div>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
