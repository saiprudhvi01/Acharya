"use client";

import { motion } from "framer-motion";
import { BookPlus, CheckCircle2, Copy, IndianRupee, LayoutDashboard, Link2, LogOut, MessageSquare, Plus, Star, Users, Video, Search } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBar, { SearchFilters } from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import OnboardingTour from "@/components/OnboardingTour";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllowedMaterialTypesForCourseLevel } from "@/lib/courseAccess";

interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  pendingAssignments: number;
  revenue: number;
  recentEnrolments: { userName: string; courseTitle: string; amount: number }[];
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [user, setUser] = useState<{ id: number; name: string; email: string; subjects?: string[] } | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0, activeCourses: 0, pendingAssignments: 0, revenue: 0, recentEnrolments: []
  });
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", description: "", category: "", subject: "", duration: "", price: "", skillLevel: "beginner" });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [materialTitle, setMaterialTitle] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [studentsView, setStudentsView] = useState<{ course: any; students: any[] } | null>(null);
  const [uploadingCert, setUploadingCert] = useState<number | null>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: "", description: "", courseId: "", scheduledFor: "", duration: "" });
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>({ courses: [], teachers: [], materials: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) { router.push("/login"); return; }

    const parsed = JSON.parse(userData);
    if (parsed.role !== "teacher") { router.push("/login"); return; }
    setUser(parsed);

    // Check if onboarding is completed
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }

    const headers = { Authorization: `Bearer ${token}` };

    const fetchCourses = () =>
      fetch(`/api/courses?teacherId=${parsed.id}`, { headers })
        .then(r => r.json())
        .then(d => setMyCourses(d.courses ?? []))
        .catch(console.error);

    fetchCourses();

    Promise.all([
      fetch(`/api/courses?teacherId=${parsed.id}`, { headers }).then(r => r.json()),
      fetch("/api/teacher/earnings", { headers }).then(r => r.json()),
      fetch("/api/assignments", { headers }).then(r => r.json()),
      fetch("/api/meetings", { headers }).then(r => r.json()),
    ]).then(([coursesData, earningsData, assignmentsData, meetingsData]) => {
      const courses = coursesData.courses ?? [];
      const payments = earningsData.payments ?? [];
      const assignments = assignmentsData.assignments ?? [];
      const meetings = meetingsData.meetings ?? [];

      const totalStudents = courses.reduce((sum: number, c: any) => sum + (c.enrolledCount ?? 0), 0);
      const activeCourses = courses.filter((c: any) => c.isApproved).length;
      const pendingAssignments = assignments.length;
      const revenue = earningsData.totalEarnings ?? 0;

      const recentEnrolments = payments.slice(0, 4).map((p: any) => ({
        userName: p.userName,
        courseTitle: p.courseTitle,
        amount: p.amount,
      }));

      setStats({ totalStudents, activeCourses, pendingAssignments, revenue, recentEnrolments });
      setMeetings(meetings);
    }).catch(console.error);
  }, [router]);

  const handleGenerateLink = () => {
    setMeetingUrl(`https://meet.acharya.edu/class-${Math.random().toString(36).substr(2, 6)}`);
  };

  const handleCreateMeeting = async () => {
    if (!meetingForm.title) return;

    setCreatingMeeting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(meetingForm)
      });

      if (res.ok) {
        const data = await res.json();
        setMeetings(prev => [data.meeting, ...prev]);
        setShowMeetingModal(false);
        setMeetingForm({ title: "", description: "", courseId: "", scheduledFor: "", duration: "" });
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
    } finally {
      setCreatingMeeting(false);
    }
  };

  const joinMeeting = (roomId: string) => {
    window.location.href = `/meeting/${roomId}`;
  };

  const fetchMaterials = async (courseId: number) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/courses/materials?courseId=${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setMaterials(data.materials ?? []);
  };

  const handleSelectCourse = (course: any) => {
    setSelectedCourse(course);
    setMaterials([]);
    fetchMaterials(course.id);
  };

  const handleUploadMaterial = async (file: File, type: string) => {
    if (!selectedCourse || !materialTitle.trim()) return;
    setUploadingMaterial(true);
    try {
      const token = localStorage.getItem("token");
      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const uploadRes = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) { alert(uploadData.error); return; }
      // Save material record
      const res = await fetch("/api/courses/materials", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourse.id, title: materialTitle, type, url: uploadData.url }),
      });
      if (res.ok) { setMaterialTitle(""); fetchMaterials(selectedCourse.id); }
    } finally {
      setUploadingMaterial(false);
    }
  };

  const handleSaveLiveLink = async () => {
    if (!selectedCourse || !liveLink.trim()) return;
    const token = localStorage.getItem("token");
    await fetch("/api/courses/materials", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: selectedCourse.id, title: "Live Class Link", type: "live", url: liveLink }),
    });
    setLiveLink("");
    fetchMaterials(selectedCourse.id);
  };

  const fetchStudents = async (course: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/teacher/students?courseId=${course.id}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setStudentsView({ course, students: data.students ?? [] });
  };

  const handleUploadCertificate = async (studentId: number, file: File) => {
    setUploadingCert(studentId);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "pdf");
      const uploadRes = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) { alert(uploadData.error); return; }
      const res = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, courseId: studentsView!.course.id, fileUrl: uploadData.url }),
      });
      if (res.ok) fetchStudents(studentsView!.course);
    } finally {
      setUploadingCert(null);
    }
  };

  const handleCreateCourse = async () => {
    setCreateError("");
    const { title, description, category, subject, duration, price, skillLevel } = createForm;
    if (!title || !description || !category || !subject || !duration || !price) {
      setCreateError("All fields are required."); return;
    }
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, subject, duration: Number(duration), price: Number(price), skillLevel }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error || "Failed to create course."); return; }
      // Refresh courses list
      const coursesRes = await fetch(`/api/courses?teacherId=${user?.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const coursesData = await coursesRes.json();
      setMyCourses(coursesData.courses ?? []);
      setShowCreateModal(false);
      setCreateForm({ title: "", description: "", category: "", subject: "", duration: "", price: "", skillLevel: "beginner" });
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = async (query: string, filters?: SearchFilters) => {
    if (!query.trim()) {
      setSearchResults({ courses: [], teachers: [], materials: [] });
      return;
    }

    setSearchLoading(true);
    setSearchQuery(query);

    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ q: query });
      
      if (filters?.type) params.append('type', filters.type);
      if (filters?.materialType) params.append('materialType', filters.materialType);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.subject) params.append('subject', filters.subject);
      if (filters?.skillLevel) params.append('skillLevel', filters.skillLevel);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

      const res = await fetch(`/api/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data.results || { courses: [], teachers: [], materials: [] });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ courses: [], teachers: [], materials: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-transparent flex relative overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl flex flex-col fixed h-full z-40 relative hidden md:flex">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/40">
              <BookPlus className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Acharya Educator</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "search", icon: Search, label: "Search" },
              { id: "courses", icon: BookPlus, label: "Manage Courses" },
              { id: "live", icon: Video, label: "Live Classes" },
              { id: "students", icon: Users, label: "Students" },
              { id: "messages", icon: MessageSquare, label: "Messages" },
              { id: "earnings", icon: IndianRupee, label: "Earnings" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
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
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-200 dark:shadow-purple-900/40">
                    {user?.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "?"}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">{user?.name || ""}</p>
                  <p className="text-xs text-purple-500 font-medium">Educator</p>
                </div>
              </div>
            </div>
          </header>

          <div className="p-8 w-full max-w-6xl mx-auto">
            {activeTab === "dashboard" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Students", value: stats.totalStudents.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Active Courses", value: stats.activeCourses.toString(), icon: BookPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Pending Assignments", value: stats.pendingAssignments.toString(), icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-500/10" },
                    { label: "Revenue", value: `₹${(stats.revenue / 1000).toFixed(1)}K`, icon: IndianRupee, color: "text-purple-500", bg: "bg-purple-500/10" }
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
                      {stats.recentEnrolments.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No enrolments yet</p>
                      ) : stats.recentEnrolments.map((enrol, i) => (
                        <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                              {enrol.userName?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{enrol.userName}</p>
                              <p className="text-xs text-slate-500">Purchased {enrol.courseTitle}</p>
                            </div>
                          </div>
                          <span className="text-emerald-500 font-medium text-sm">+ ₹{enrol.amount?.toLocaleString()}</span>
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

            {activeTab === "search" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-2xl font-bold">Search</h2>
                <SearchBar 
                  onSearch={handleSearch}
                  placeholder="Search for keywords, PDFs, videos, teachers..."
                  showFilters={true}
                />
                <SearchResults 
                  results={searchResults}
                  loading={searchLoading}
                  onMaterialClick={(material) => {
                    if (material.type === 'pdf') {
                      window.open(material.url, '_blank');
                    } else {
                      window.open(material.url, '_blank');
                    }
                  }}
                  onCourseClick={(course) => {
                    setActiveTab('courses');
                    setSelectedCourse(course);
                  }}
                  onTeacherClick={(teacher) => {
                    console.log('Teacher clicked:', teacher);
                  }}
                />
              </motion.div>
            )}

            {activeTab === "live" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Live Classes</h2>
                  <button
                    onClick={() => setShowMeetingModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-purple-700 transition-colors"
                  >
                    <Plus size={18} /> Create Meeting
                  </button>
                </div>

                {meetings.length === 0 ? (
                  <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <Video className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No meetings yet</h3>
                    <p className="text-slate-500 mb-6">Create your first video meeting to get started.</p>
                    <button
                      onClick={() => setShowMeetingModal(true)}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                    >
                      Create Meeting
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meetings.map((meeting: any) => (
                      <div key={meeting.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{meeting.title}</h3>
                            {meeting.courseTitle && (
                              <p className="text-sm text-slate-500">{meeting.courseTitle}</p>
                            )}
                          </div>
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                            <Video className="text-purple-600 dark:text-purple-400" size={20} />
                          </div>
                        </div>

                        {meeting.description && (
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                            {meeting.description}
                          </p>
                        )}

                        {meeting.scheduledFor && (
                          <div className="text-sm text-slate-500 mb-4">
                            Scheduled: {new Date(meeting.scheduledFor).toLocaleString()}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => joinMeeting(meeting.roomId)}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                          >
                            Join Meeting
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/meeting/${meeting.roomId}`);
                            }}
                            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "courses" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {!selectedCourse ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">My Courses</h2>
                      <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-purple-700 transition-colors">
                        <Plus size={18} /> Create Course
                      </button>
                    </div>
                    {myCourses.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                        <BookPlus className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">No courses yet</h3>
                        <p className="text-slate-500 mb-6">Create your first course to get started.</p>
                        <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">Create Course</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myCourses.map((course, i) => (
                          <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-lg">{course.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.isApproved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                {course.isApproved ? 'Active' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-2 capitalize">{course.skillLevel} level</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><Users size={14} /> {course.enrolledStudents ?? 0}</span>
                                <span className="flex items-center gap-1"><IndianRupee size={14} /> {course.price}</span>
                              </div>
                              <button onClick={() => handleSelectCourse(course)} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                                Manage Content
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelectedCourse(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        ← Back
                      </button>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                        <p className="text-sm text-purple-600 dark:text-purple-400 capitalize font-medium">{selectedCourse.skillLevel} level</p>
                      </div>
                    </div>

                    {/* Upload section */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold text-lg mb-2">Upload Course Materials</h3>
                      <p className="text-sm text-slate-500 mb-6">
                        {selectedCourse.skillLevel === 'beginner'
                          ? 'Beginner courses can only publish PDF materials.'
                          : selectedCourse.skillLevel === 'intermediate'
                            ? 'Intermediate courses can publish PDFs and videos.'
                            : 'Advanced courses can publish PDFs, videos, and live class links.'}
                      </p>

                      <div className="space-y-6">
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                          <h4 className="font-medium text-sm mb-4">📄 Add PDF Material</h4>
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={materialTitle}
                              onChange={e => setMaterialTitle(e.target.value)}
                              placeholder="e.g. Chapter 1 Notes"
                              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <input
                              type="file"
                              accept=".pdf"
                              disabled={uploadingMaterial}
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadMaterial(file, 'pdf');
                              }}
                              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                            />
                          </div>
                        </div>

                        {getAllowedMaterialTypesForCourseLevel(selectedCourse?.skillLevel).includes('video') && (
                          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <h4 className="font-medium text-sm mb-4">🎥 Add Video Lesson</h4>
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={materialTitle}
                                onChange={e => setMaterialTitle(e.target.value)}
                                placeholder="e.g. Lesson 1 - Intro"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <input
                                type="file"
                                accept="video/*"
                                disabled={uploadingMaterial}
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUploadMaterial(file, 'video');
                                }}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                              />
                            </div>
                          </div>
                        )}

                        {getAllowedMaterialTypesForCourseLevel(selectedCourse?.skillLevel).includes('live') && (
                          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <h4 className="font-medium text-sm mb-4">🔴 Add Live Class Link</h4>
                            <div className="space-y-4">
                              <input
                                type="url"
                                value={liveLink}
                                onChange={e => setLiveLink(e.target.value)}
                                placeholder="https://meet.google.com/..."
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <button onClick={handleSaveLiveLink} className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
                                Save Live Link
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {uploadingMaterial && <p className="text-sm text-purple-500 mt-4">Uploading...</p>}
                    </div>

                    {/* Existing materials */}
                    {materials.length > 0 && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Uploaded Content</h3>
                        <div className="space-y-3">
                          {materials.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{m.type === 'pdf' ? '📄' : m.type === 'video' ? '🎥' : '🔴'}</span>
                                <div>
                                  <p className="font-medium text-sm">{m.title}</p>
                                  <p className="text-xs text-slate-500 capitalize">{m.type}</p>
                                </div>
                              </div>
                              <button
                                onClick={async () => {
                                  const token = localStorage.getItem("token");
                                  await fetch(`/api/courses/materials?materialId=${m.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                                  fetchMaterials(selectedCourse.id);
                                }}
                                className="text-red-500 text-xs hover:underline"
                              >Remove</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === "students" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {!studentsView ? (
                  <>
                    <h2 className="text-2xl font-bold">Students by Course</h2>
                    {myCourses.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                        <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-500">No courses yet. Create a course first.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myCourses.map((course, i) => (
                          <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
                            <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                            <p className="text-sm text-slate-500 capitalize mb-4">{course.skillLevel} level</p>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-sm text-slate-500"><Users size={16} /> {course.enrolledStudents ?? 0} students</span>
                              <button onClick={() => fetchStudents(course)} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                                View Students
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setStudentsView(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium">← Back</button>
                      <div>
                        <h2 className="text-2xl font-bold">{studentsView.course.title}</h2>
                        <p className="text-sm text-slate-500">{studentsView.students.length} enrolled students</p>
                      </div>
                    </div>
                    {studentsView.students.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                        <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-500">No students enrolled yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {studentsView.students.map((student, i) => (
                          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 font-bold text-sm">
                                {student.name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold">{student.name}</p>
                                <p className="text-xs text-slate-500">{student.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {student.certificateUrl ? (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">✅ Certificate Issued</span>
                              ) : (
                                <span className="text-xs text-slate-400">No certificate</span>
                              )}
                              <label className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${uploadingCert === student.id
                                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}>
                                {uploadingCert === student.id ? 'Uploading...' : student.certificateUrl ? 'Replace Certificate' : 'Upload Certificate'}
                                <input
                                  type="file"
                                  accept=".pdf,image/*"
                                  className="hidden"
                                  disabled={uploadingCert === student.id}
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadCertificate(student.id, file);
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
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
                            <td className="p-4 text-slate-600 dark:text-slate-400">Student {i + 1}</td>
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

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
            {createError && <p className="text-red-500 text-sm mb-4">{createError}</p>}
            <div className="space-y-4">
              {([
                { key: "title", label: "Course Title", type: "text" },
                { key: "category", label: "Category", type: "text" },
                { key: "subject", label: "Subject", type: "text" },
                { key: "duration", label: "Duration (hours)", type: "number" },
                { key: "price", label: "Price (₹)", type: "number" },
              ] as const).map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    type={type}
                    value={createForm[key]}
                    onChange={e => setCreateForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">Skill Level</label>
                <select
                  value={createForm.skillLevel}
                  onChange={e => setCreateForm(f => ({ ...f, skillLevel: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCreateModal(false); setCreateError(""); }} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleCreateCourse} disabled={creating} className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50">
                {creating ? "Creating..." : "Create Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Meeting Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create Meeting</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meeting Title</label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={e => setMeetingForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Advanced React Workshop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={meetingForm.description}
                  onChange={e => setMeetingForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="What will this meeting cover?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Course (Optional)</label>
                <select
                  value={meetingForm.courseId}
                  onChange={e => setMeetingForm(f => ({ ...f, courseId: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a course</option>
                  {myCourses.map((course: any) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scheduled For (Optional)</label>
                <input
                  type="datetime-local"
                  value={meetingForm.scheduledFor}
                  onChange={e => setMeetingForm(f => ({ ...f, scheduledFor: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes, Optional)</label>
                <input
                  type="number"
                  value={meetingForm.duration}
                  onChange={e => setMeetingForm(f => ({ ...f, duration: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 60"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMeetingModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMeeting}
                disabled={creatingMeeting || !meetingForm.title}
                className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {creatingMeeting ? "Creating..." : "Create Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour
          onComplete={() => setShowOnboarding(false)}
          userRole="teacher"
        />
      )}
    </>
  );
}