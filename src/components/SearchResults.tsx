'use client';

import { motion } from 'framer-motion';
import { BookOpen, Video, Users, Clock, IndianRupee, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

interface SearchResultsProps {
  results: {
    courses: any[];
    teachers: any[];
    materials: any[];
  };
  loading?: boolean;
  onMaterialClick?: (material: any) => void;
  onCourseClick?: (course: any) => void;
  onTeacherClick?: (teacher: any) => void;
}

export default function SearchResults({ results, loading, onMaterialClick, onCourseClick, onTeacherClick }: SearchResultsProps) {
  const { courses, teachers, materials } = results;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const hasResults = courses.length > 0 || teachers.length > 0 || materials.length > 0;

  if (!hasResults) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h3 className="text-xl font-bold mb-2">No results found</h3>
        <p className="text-slate-500">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Materials Section */}
      {materials.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            PDFs & Videos ({materials.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((material, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onMaterialClick?.(material)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {material.type === 'pdf' ? '📄' : material.type === 'video' ? '🎥' : '🔴'}
                    </span>
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1">{material.title}</h3>
                      <p className="text-xs text-slate-500">{material.courseTitle}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    material.type === 'pdf' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>
                    {material.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{material.subject}</span>
                  <span>{material.teacherName}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Teachers Section */}
      {teachers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Available Teachers ({teachers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((teacher, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {teacher.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold">{teacher.name}</h3>
                      <p className="text-sm text-slate-500">{teacher.subjects ? JSON.parse(teacher.subjects).join(', ') : 'Various subjects'}</p>
                    </div>
                  </div>
                  {/* Availability Signal */}
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    teacher.isAvailable 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {teacher.isAvailable ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Available
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Unavailable
                      </>
                    )}
                  </div>
                </div>

                {/* Timings */}
                {teacher.availabilityHours && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>{teacher.availabilityHours}</span>
                  </div>
                )}

                {/* Pricing */}
                {teacher.hourlyRate && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <IndianRupee className="w-4 h-4" />
                    <span>₹{teacher.hourlyRate}/hour</span>
                  </div>
                )}

                {/* Channel */}
                {teacher.channelUrl && (
                  <div className="flex items-center gap-2 mb-4">
                    <a
                      href={teacher.channelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      <span>YouTube Channel</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Bio */}
                {teacher.bio && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                    {teacher.bio}
                  </p>
                )}

                <button
                  onClick={() => onTeacherClick?.(teacher)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  View Profile
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Courses Section */}
      {courses.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Related Courses ({courses.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onCourseClick?.(course)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-500">{course.teacherName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.skillLevel === 'beginner'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : course.skillLevel === 'intermediate'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {course.skillLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">₹{course.price}</span>
                  <span className="text-xs text-slate-500">{course.subject}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
