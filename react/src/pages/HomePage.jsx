"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { PlusIcon } from "lucide-react";
import toast from "react-hot-toast";
import CourseCard from "../components/CourseCard";
import NewCourseModal from "../components/NewCourseModal";
import {
  fetchCoursesForUser,
  fetchUserProgress,
  fetchOrCreateUserByEmail,
} from "../services/api";

function HomePage() {
  const { user } = useUser();
  const [backendUser, setBackendUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [otherCourses, setOtherCourses] = useState([]);

  // Fetch or create backend user, then load courses and progress
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (!user) return;

        const email = user.emailAddresses?.[0]?.emailAddress;
        const name = user.fullName || user.firstName || "Unknown";

        const backendUser = await fetchOrCreateUserByEmail(email, name);
        setBackendUser(backendUser);

        const coursesData = await fetchCoursesForUser(backendUser._id);
        setCourses(coursesData);

        const progressData = calculateProgress(coursesData);
        setUserProgress(progressData);

        const recRes = await fetch(
          `http://localhost:8080/api/courses/recommendations?email=${encodeURIComponent(email)}`
        );
        const { recommended } = await recRes.json();

        const recommendedCourses = coursesData.filter((c) =>
          recommended?.includes(c._id)
        );
        const otherCourses = coursesData.filter(
          (c) => !recommended?.includes(c._id)
        );

        setRecommendedCourses(recommendedCourses);
        setOtherCourses(otherCourses);
      } catch (error) {
        console.error("Error loading home data:", error);
        toast.error("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses));
    localStorage.setItem("userProgress", JSON.stringify(userProgress));
  }, [courses, userProgress]);

  const handleNewCourse = async (newCourse) => {
    setIsModalOpen(false);
    toast.success("New course created!");
    if (backendUser) {
      const coursesData = await fetchCoursesForUser(backendUser._id);
      setCourses(coursesData);
    }
  };

  const calculateProgress = (courses) => {
    const progress = {};

    courses.forEach((course) => {
      const totalQuizzes = course.quizzes.length;
      const completedQuizzes = course.quizzes.filter(
        (q) => (q.quiz.scores?.length || 0) > 0
      ).length;

      const totalAssigns = course.assignments.length;
      const completedAssigns = course.assignments.filter(
        (a) => (a.assignment.submissions?.length || 0) > 0
      ).length;

      const totalItems = totalQuizzes + totalAssigns;
      const doneItems = completedQuizzes + completedAssigns;

      const percent =
        totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

      progress[course._id] = percent;
    });

    return progress;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Welcome back 👋
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 shadow-md"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create Course</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-100 dark:bg-gray-800 rounded-lg text-center shadow-inner">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            No courses available
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start your journey by creating your first course.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md"
          >
            Create Course
          </button>
        </div>
      ) : (
        <>
          {recommendedCourses.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Recommended for You
              </h2>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedCourses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    progress={userProgress[course._id] || 0}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              {recommendedCourses.length > 0 ? "All Courses" : "Your Courses"}
            </h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {otherCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  progress={userProgress[course._id] || 0}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {isModalOpen && (
        <NewCourseModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleNewCourse}
          userId={backendUser?._id}
        />
      )}
    </div>
  );
}

export default HomePage;
