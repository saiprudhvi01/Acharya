'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, BookOpen, Users, Search, Video, Award, LayoutDashboard, PlayCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Slide {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Welcome to Acharya! � привет",
    description: "Your intelligent e-learning platform for seamless education",
    icon: LayoutDashboard,
    color: "from-purple-500 to-indigo-600",
    features: [
      "Learn from expert teachers",
      "Access quality courses",
      "Track your progress"
    ]
  },
  {
    id: 2,
    title: "Dashboard Overview",
    description: "Your personal learning hub at a glance",
    icon: LayoutDashboard,
    color: "from-blue-500 to-cyan-600",
    features: [
      "View enrolled courses",
      "Track attendance",
      "Monitor assignments",
      "Check achievements"
    ]
  },
  {
    id: 3,
    title: "Browse Courses",
    description: "Discover and enroll in courses that match your interests",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
    features: [
      "Explore course marketplace",
      "Filter by subject & level",
      "Read teacher profiles",
      "Enroll with flexible plans"
    ]
  },
  {
    id: 4,
    title: "Smart Search",
    description: "Find exactly what you need with powerful search",
    icon: Search,
    color: "from-pink-500 to-rose-600",
    features: [
      "Search by keywords",
      "Find PDFs & videos",
      "Discover available teachers",
      "Filter by price & level"
    ]
  },
  {
    id: 5,
    title: "Live Classes",
    description: "Join interactive live sessions with your teachers",
    icon: Video,
    color: "from-orange-500 to-amber-600",
    features: [
      "Attend scheduled classes",
      "Interact in real-time",
      "Access recordings",
      "Participate in discussions"
    ]
  },
  {
    id: 6,
    title: "Track Progress",
    description: "Monitor your learning journey and achievements",
    icon: Award,
    color: "from-violet-500 to-purple-600",
    features: [
      "View completion stats",
      "Earn certificates",
      "Check assignment grades",
      "Build your portfolio"
    ]
  },
  {
    id: 7,
    title: "You're All Set! 🚀",
    description: "Start your learning journey now",
    icon: CheckCircle2,
    color: "from-green-500 to-emerald-600",
    features: [
      "Access your dashboard",
      "Explore courses",
      "Connect with teachers",
      "Begin learning today!"
    ]
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
  userRole: 'student' | 'teacher';
}

export default function OnboardingTour({ onComplete, userRole }: OnboardingTourProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const skipTour = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onComplete();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Acharya Tour</h2>
              <p className="text-sm text-slate-500">Welcome, {userRole === 'student' ? 'Student' : 'Teacher'}!</p>
            </div>
          </div>
          <button
            onClick={skipTour}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-6">
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : index < currentSlide
                    ? 'bg-purple-300 dark:bg-purple-700'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-2 text-center">
            Step {currentSlide + 1} of {slides.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              {/* Icon Animation */}
              <div className="flex justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${currentSlideData.color} flex items-center justify-center shadow-lg`}
                >
                  <Icon className="text-white w-12 h-12" />
                </motion.div>
              </div>

              {/* Title and Description */}
              <div className="text-center space-y-3">
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold"
                >
                  {currentSlideData.title}
                </motion.h3>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-600 dark:text-slate-400 text-lg"
                >
                  {currentSlideData.description}
                </motion.p>
              </div>

              {/* Features List */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto"
              >
                {currentSlideData.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentSlide === slides.length - 1 ? (
            <button
              onClick={skipTour}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Get Started
              <PlayCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={nextSlide}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
