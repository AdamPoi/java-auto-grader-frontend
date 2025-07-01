// Admin Dashboard Types
export interface DashboardKPI {
    activeAssignments: number;
    activeCourses: number;
    totalStudents: number;
}

export interface HeatmapData {
    date: string;
    count: number;
}

export interface GradeDistribution {
    gradeRange: string;
    count: number;
}

export interface RecentSubmission {
    submissionId: string;
    studentName: string;
    studentAvatar?: string;
    assignmentTitle: string;
    courseName: string;
    submittedAt: string;
    status: string;
}

export interface AssignmentPerformance {
    name: string;
    averageScore: number;
}

export interface UpcomingDeadline {
    assignmentId: string;
    title: string;
    course: string;
    dueDate: string;
}

export interface AdminDashboard {
    kpis: DashboardKPI;
    recentSubmissions: RecentSubmission[];
    classPerformance: AssignmentPerformance[];
    upcomingDeadlines: UpcomingDeadline[];
}

// Student Dashboard Types 

export interface WelcomeBanner {
    studentName: string;
    nextAssignmentId?: string;
    nextAssignmentTitle?: string;
    nextAssignmentCourse?: string;
    nextAssignmentDueDate?: string;
}

export interface RecentGrade {
    assignmentTitle: string;
    courseName: string;
    grade: string;
    status: string;
}

export interface CourseProgress {
    courseId: string;
    courseName: string;
    average: number;
}

export interface StudentDashboard {
    welcomeBanner: WelcomeBanner;
    recentGrades: RecentGrade[];
    overallPerformance: {
        average: number;
    };
    courseProgress: CourseProgress[];
    upcomingDeadlines: UpcomingDeadline[];
}