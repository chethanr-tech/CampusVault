const API_BASE_URL = "http://localhost:5000/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    college: string;
    department: string;
    semester: number;
    avatar?: string;
    createdAt: string;
    isApproved: boolean;
    isUniversityEmail: boolean;
    pendingApproval?: boolean;
}

export interface Resource {
    id: string;
    title: string;
    subject: string;
    semester: number;
    department: string;
    type: "Notes" | "Solutions" | "Question Papers" | "Lab Reports" | "Other";
    isPrivate: boolean;
    uploaderId: string;
    uploaderName: string;
    uploaderCollege: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    downloads: number;
    averageRating: number;
    totalRatings: number;
    createdAt: string;
    sharedWith?: string[];
    restrictedToUniversity?: string;
}

export interface Review {
    id: string;
    resourceId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export type SortOption = "latest" | "highest_rated" | "most_popular";

export interface SearchFilters {
    query?: string;
    subject?: string;
    semester?: number;
    department?: string;
    isPrivate?: boolean;
    sort?: SortOption;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_USERS: User[] = [
    { id: "u1", name: "Aarav Sharma", email: "aarav@iit.edu", college: "IIT Delhi", department: "Computer Science", semester: 5, createdAt: "2024-08-15", isApproved: true, isUniversityEmail: true },
    { id: "u2", name: "Priya Patel", email: "priya@bits.edu", college: "BITS Pilani", department: "Electronics & Communication", semester: 3, createdAt: "2024-09-01", isApproved: true, isUniversityEmail: true },
    { id: "u3", name: "Rohan Kumar", email: "rohan@iit.edu", college: "IIT Delhi", department: "Mechanical Engineering", semester: 7, createdAt: "2024-07-20", isApproved: true, isUniversityEmail: true },
];

const MOCK_RESOURCES: Resource[] = [
    { id: "r1", title: "Data Structures Complete Notes", subject: "Data Structures", semester: 3, department: "Computer Science", type: "Notes", isPrivate: false, uploaderId: "u1", uploaderName: "Aarav Sharma", uploaderCollege: "IIT Delhi", fileUrl: "/files/ds-notes.pdf", fileType: "pdf", fileSize: 2400000, downloads: 342, averageRating: 4.5, totalRatings: 28, createdAt: "2024-10-15", sharedWith: [] },
    { id: "r2", title: "Digital Electronics Lab Report", subject: "Digital Electronics", semester: 3, department: "Electronics & Communication", type: "Lab Reports", isPrivate: true, uploaderId: "u2", uploaderName: "Priya Patel", uploaderCollege: "BITS Pilani", fileUrl: "/files/de-lab.pdf", fileType: "pdf", fileSize: 1800000, downloads: 89, averageRating: 4.0, totalRatings: 12, createdAt: "2024-11-02", sharedWith: [] },
    { id: "r3", title: "Thermodynamics Solutions Set", subject: "Thermodynamics", semester: 5, department: "Mechanical Engineering", type: "Solutions", isPrivate: false, uploaderId: "u3", uploaderName: "Rohan Kumar", uploaderCollege: "IIT Delhi", fileUrl: "/files/thermo-sol.pdf", fileType: "pdf", fileSize: 3200000, downloads: 215, averageRating: 4.8, totalRatings: 45, createdAt: "2024-09-28", sharedWith: [], restrictedToUniversity: "IIT Delhi" },
    { id: "r4", title: "Operating Systems Previous Year Papers", subject: "Operating Systems", semester: 5, department: "Computer Science", type: "Question Papers", isPrivate: false, uploaderId: "u1", uploaderName: "Aarav Sharma", uploaderCollege: "IIT Delhi", fileUrl: "/files/os-pyq.pdf", fileType: "pdf", fileSize: 1500000, downloads: 567, averageRating: 4.7, totalRatings: 63, createdAt: "2024-10-20", sharedWith: [] },
    { id: "r5", title: "Machine Learning Lecture Notes", subject: "Machine Learning", semester: 7, department: "Computer Science", type: "Notes", isPrivate: true, uploaderId: "u1", uploaderName: "Aarav Sharma", uploaderCollege: "IIT Delhi", fileUrl: "/files/ml-notes.pdf", fileType: "pdf", fileSize: 5100000, downloads: 198, averageRating: 4.9, totalRatings: 34, createdAt: "2024-11-10", sharedWith: ["priya@bits.edu"] },
    { id: "r6", title: "Circuit Analysis Solved Examples", subject: "Circuit Analysis", semester: 3, department: "Electronics & Communication", type: "Solutions", isPrivate: false, uploaderId: "u2", uploaderName: "Priya Patel", uploaderCollege: "BITS Pilani", fileUrl: "/files/circuits.pdf", fileType: "pdf", fileSize: 2700000, downloads: 143, averageRating: 3.8, totalRatings: 19, createdAt: "2024-10-05", sharedWith: [] },
];

const MOCK_REVIEWS: Review[] = [
    { id: "rev1", resourceId: "r1", userId: "u2", userName: "Priya Patel", rating: 5, comment: "Excellent notes! Very well organized and covers all topics.", createdAt: "2024-10-20" },
    { id: "rev2", resourceId: "r1", userId: "u3", userName: "Rohan Kumar", rating: 4, comment: "Good coverage but could use more examples.", createdAt: "2024-10-22" },
    { id: "rev3", resourceId: "r3", userId: "u1", userName: "Aarav Sharma", rating: 5, comment: "Saved my semester! Step-by-step solutions are perfect.", createdAt: "2024-10-01" },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

let currentUser: User | null = null;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── API Client ──────────────────────────────────────────────────────────────

export const apiClient = {
    // Auth
    async register(data: { name: string; email: string; password: string; college: string; department: string; semester: number }): Promise<AuthResponse> {
        await delay(600);
        const isUniversityEmail = /\.(edu|ac\.[a-z]{2})$/i.test(data.email);
        const user: User = {
            id: "u" + Date.now(),
            name: data.name,
            email: data.email,
            college: data.college,
            department: data.department,
            semester: data.semester,
            createdAt: new Date().toISOString(),
            isUniversityEmail,
            isApproved: isUniversityEmail,
            pendingApproval: !isUniversityEmail
        };
        currentUser = user;
        localStorage.setItem("cv_user", JSON.stringify(user));
        localStorage.setItem("cv_token", "mock-token-" + user.id);
        return { user, token: "mock-token-" + user.id };
    },

    async login(email: string, _password: string): Promise<AuthResponse> {
        await delay(600);
        const user = MOCK_USERS.find((u) => u.email === email) || MOCK_USERS[0];
        currentUser = user;
        localStorage.setItem("cv_user", JSON.stringify(user));
        localStorage.setItem("cv_token", "mock-token-" + user.id);
        return { user, token: "mock-token-" + user.id };
    },

    async logout(): Promise<void> {
        await delay(200);
        currentUser = null;
        localStorage.removeItem("cv_user");
        localStorage.removeItem("cv_token");
    },

    async getSession(): Promise<User | null> {
        const stored = localStorage.getItem("cv_user");
        if (stored) {
            currentUser = JSON.parse(stored);
            return currentUser;
        }
        return null;
    },

    // Resources
    async getResources(filters?: SearchFilters): Promise<Resource[]> {
        await delay(400);
        let results = [...MOCK_RESOURCES];
        if (filters) {
            if (filters.query) {
                const q = filters.query.toLowerCase();
                results = results.filter((r) => r.title.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q));
            }
            if (filters.subject) results = results.filter((r) => r.subject === filters.subject);
            if (filters.semester) results = results.filter((r) => r.semester === filters.semester);
            if (filters.department) results = results.filter((r) => r.department === filters.department);
            if (filters.isPrivate !== undefined) results = results.filter((r) => r.isPrivate === filters.isPrivate);
            if (filters.sort === "latest") results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            else if (filters.sort === "highest_rated") results.sort((a, b) => b.averageRating - a.averageRating);
            else if (filters.sort === "most_popular") results.sort((a, b) => b.downloads - a.downloads);
        }
        return results;
    },

    async getResource(id: string): Promise<Resource | null> {
        await delay(300);
        return MOCK_RESOURCES.find((r) => r.id === id) || null;
    },

    async uploadResource(data: { title: string; subject: string; semester: number; department: string; type: Resource["type"]; isPrivate: boolean; file: File; restrictToUniversity?: boolean }): Promise<Resource> {
        await delay(800);
        const user = currentUser!;
        const resource: Resource = {
            id: "r" + Date.now(), title: data.title, subject: data.subject, semester: data.semester, department: data.department, type: data.type,
            isPrivate: data.isPrivate, uploaderId: user.id, uploaderName: user.name, uploaderCollege: user.college,
            fileUrl: "/files/" + data.file.name, fileType: data.file.name.split(".").pop() || "pdf", fileSize: data.file.size,
            downloads: 0, averageRating: 0, totalRatings: 0, createdAt: new Date().toISOString(),
            sharedWith: [],
            restrictedToUniversity: data.restrictToUniversity ? user.college : undefined,
        };
        MOCK_RESOURCES.unshift(resource);
        return resource;
    },

    async shareResource(resourceId: string, email: string): Promise<void> {
        await delay(300);
        const resource = MOCK_RESOURCES.find((r) => r.id === resourceId);
        if (!resource) throw new Error("Resource not found");
        if (resource.uploaderId !== currentUser?.id) throw new Error("Only resource owner can share");
        if (!resource.sharedWith) resource.sharedWith = [];
        if (!resource.sharedWith.includes(email)) {
            resource.sharedWith.push(email);
        }
    },

    async unshareResource(resourceId: string, email: string): Promise<void> {
        await delay(300);
        const resource = MOCK_RESOURCES.find((r) => r.id === resourceId);
        if (!resource) throw new Error("Resource not found");
        if (resource.uploaderId !== currentUser?.id) throw new Error("Only resource owner can unshare");
        if (resource.sharedWith) {
            resource.sharedWith = resource.sharedWith.filter((e) => e !== email);
        }
    },

    canAccessResource(resource: Resource, user: User | null): { canAccess: boolean; reason?: string } {
        if (!resource.isPrivate && !resource.restrictedToUniversity) {
            return { canAccess: !!user };
        }

        if (!user) {
            return { canAccess: false, reason: "Please sign in to access this resource" };
        }

        if (!user.isApproved || user.pendingApproval) {
            return { canAccess: false, reason: "Your account is pending university approval" };
        }

        if (resource.restrictedToUniversity && user.college !== resource.restrictedToUniversity) {
            return { canAccess: false, reason: `This resource is restricted to ${resource.restrictedToUniversity} students` };
        }

        // Private resources
        if (resource.isPrivate) {
            // Owner can always access
            if (resource.uploaderId === user.id) {
                return { canAccess: true };
            }

            // Check if shared with user
            if (resource.sharedWith?.includes(user.email)) {
                return { canAccess: true };
            }

            // Private means ONLY owner and explicitly shared users (no same college access)
            return { canAccess: false, reason: "This resource is private. Only the owner can access it unless explicitly shared." };
        }

        return { canAccess: true };
    },

    // Reviews
    async getReviews(resourceId: string): Promise<Review[]> {
        await delay(300);
        return MOCK_REVIEWS.filter((r) => r.resourceId === resourceId);
    },

    async addReview(data: { resourceId: string; rating: number; comment: string }): Promise<Review> {
        await delay(500);
        const user = currentUser!;
        const existing = MOCK_REVIEWS.find((r) => r.resourceId === data.resourceId && r.userId === user.id);
        if (existing) throw new Error("You have already reviewed this resource.");
        const review: Review = { id: "rev" + Date.now(), resourceId: data.resourceId, userId: user.id, userName: user.name, rating: data.rating, comment: data.comment, createdAt: new Date().toISOString() };
        MOCK_REVIEWS.push(review);
        return review;
    },

    // Meta
    getSubjects(): string[] {
        return [...new Set(MOCK_RESOURCES.map((r) => r.subject))];
    },
    getDepartments(): string[] {
        return [...new Set(MOCK_RESOURCES.map((r) => r.department))];
    },
    getSemesters(): number[] {
        return [...new Set(MOCK_RESOURCES.map((r) => r.semester))].sort((a, b) => a - b);
    },
};
