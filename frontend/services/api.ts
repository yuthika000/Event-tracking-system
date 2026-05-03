import { User, UserRole, LeaveRequest, RequestStatus } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
    auth: {
        signup: async (user: Partial<User> & { password?: string, username?: string }) => {
            // Map frontend fields to backend expected User object
            // Backend expects: username, password, role. 
            // Frontend provides: name, rollNumber, email, etc.
            // We will map 'email' or 'rollNumber' to 'username' based on logic in component,
            // but here we just pass what we get if it matches.

            const payload = {
                username: user.username || user.rollNumber,
                password: user.password,
                role: user.role,
                name: user.name,
                registerNumber: user.rollNumber,
                department: user.department,
                year: user.year,
                parentPhoneNumber: user.parentPhoneNumber,
                email: user.email
            };

            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Signup failed');
            return response.json();
        },

        login: async (username: string, password: string, parentPhoneNumber?: string) => {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, parentPhoneNumber }),
            });
            console.log("Response status:", response.status);
            if (!response.ok) {
                // Try to read text if json fails or just throw
                throw new Error('Login failed');
            }
            // Backend returns User object on success, or empty/null on failure (handled in controller)
            // But spring controller returns null? fetch might see 200 OK with empty body.
            const data = await response.text();
            if (!data) throw new Error('Invalid login credentials');
            return JSON.parse(data);
        },

        advisorSignup: async (name: string, email: string, password: string) => {
            const response = await fetch(`${API_BASE_URL}/auth/advisor/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            if (!response.ok) throw new Error('Advisor signup failed');
            return response.json();
        },
    },

    advisors: {
        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/leave/advisors`);
            if (!response.ok) return [];
            return response.json();
        },

        getByUserId: async (userId: string) => {
            const response = await fetch(`${API_BASE_URL}/leave/advisor/by-user/${userId}`);
            if (!response.ok) return null;
            return response.json();
        }
    },

    requests: {
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/leave/all`);
                if (!response.ok) return [];
                const data = await response.json();

                // Map Backend Entity to Frontend Interface
                return data.map((item: any) => {
                    // Normalize Status from Backend (e.g. "PENDING_ADVISOR") to Frontend Enum (e.g. "Pending Advisor")
                    let status = item.status;
                    if (status === 'PENDING_ADVISOR') status = RequestStatus.PENDING_ADVISOR;
                    else if (status === 'PENDING_HOD') status = RequestStatus.PENDING_HOD;
                    else if (status === 'PENDING_PRINCIPAL') status = RequestStatus.PENDING_PRINCIPAL;
                    else if (status === 'APPROVED' || status === 'Approved') status = RequestStatus.APPROVED;
                    else if (status === 'REJECTED' || status === 'Rejected') status = RequestStatus.REJECTED;

                    // Generate Synthetic History based on Status
                    // Since backend doesn't store history, we infer it to make the UI timeline visible.
                    const history: any[] = [{ role: UserRole.STUDENT, action: 'Submitted', timestamp: item.createdAt || new Date().toISOString() }];

                    if (status === RequestStatus.PENDING_HOD) {
                        history.push({ role: UserRole.ADVISOR, action: 'Approved', timestamp: new Date().toISOString() });
                    } else if (status === RequestStatus.PENDING_PRINCIPAL) {
                        history.push({ role: UserRole.ADVISOR, action: 'Approved', timestamp: new Date().toISOString() });
                        history.push({ role: UserRole.HOD, action: 'Approved', timestamp: new Date().toISOString() });
                    } else if (status === RequestStatus.APPROVED) {
                        history.push({ role: UserRole.ADVISOR, action: 'Approved', timestamp: new Date().toISOString() });
                        history.push({ role: UserRole.HOD, action: 'Approved', timestamp: new Date().toISOString() });
                        history.push({ role: UserRole.PRINCIPAL, action: 'Approved', timestamp: new Date().toISOString() });
                    } else if (status === RequestStatus.REJECTED) {
                        // If rejected, we don't know who, but we default to Advisor for visibility or assume the process failed.
                        // We will add a rejection entry for Advisor so the first circle turns Red.
                        history.push({ role: UserRole.ADVISOR, action: 'Rejected', comment: "Request Rejected", timestamp: new Date().toISOString() });
                    }

                    return {
                        id: item.id.toString(),
                        studentId: item.student?.user?.id, // Important for filtering
                        studentName: item.student?.name || item.username,
                        rollNumber: item.student?.registerNumber,
                        category: item.category,
                        purpose: item.reason,
                        fromDate: item.fromDate,
                        toDate: item.toDate,
                        status: status,
                        parentPhoneNumber: item.student?.parentPhoneNumber,
                        createdAt: new Date().toISOString(), // Backend doesn't send this yet
                        history: history
                    };
                });
            } catch (e) {
                console.warn("Fetch requests failed:", e);
                return [];
            }
        },

        getByAdvisor: async (advisorId: string) => {
            try {
                const response = await fetch(`${API_BASE_URL}/leave/advisor/${advisorId}`);
                if (!response.ok) return [];
                const data = await response.json();

                // Map Backend Entity to Frontend Interface (same logic as getAll)
                return data.map((item: any) => {
                    let status = item.status;
                    if (status === 'PENDING_ADVISOR') status = RequestStatus.PENDING_ADVISOR;
                    else if (status === 'PENDING_HOD') status = RequestStatus.PENDING_HOD;
                    else if (status === 'PENDING_PRINCIPAL') status = RequestStatus.PENDING_PRINCIPAL;
                    else if (status === 'APPROVED' || status === 'Approved') status = RequestStatus.APPROVED;
                    else if (status === 'REJECTED' || status === 'Rejected') status = RequestStatus.REJECTED;

                    const history: any[] = [{ role: UserRole.STUDENT, action: 'Submitted', timestamp: item.createdAt || new Date().toISOString() }];

                    if (status === RequestStatus.PENDING_HOD) {
                        history.push({ role: UserRole.ADVISOR, action: 'Approved', timestamp: new Date().toISOString() });
                    } else if (status === RequestStatus.PENDING_PRINCIPAL) {
                        history.push({ role: UserRole.ADVISOR, action: 'Approved', timestamp: new Date().toISOString() });
                        history.push({ role: UserRole.HOD, action: 'Approved', timestamp: new Date().toISOString() });
                    } else if (status === RequestStatus.APPROVED) {
                        history.push({ role: UserRole.ADVISOR, action: 'Approved', timestamp: new Date().toISOString() });
                        history.push({ role: UserRole.HOD, action: 'Approved', timestamp: new Date().toISOString() });
                        history.push({ role: UserRole.PRINCIPAL, action: 'Approved', timestamp: new Date().toISOString() });
                    } else if (status === RequestStatus.REJECTED) {
                        history.push({ role: UserRole.ADVISOR, action: 'Rejected', comment: "Request Rejected", timestamp: new Date().toISOString() });
                    }

                    return {
                        id: item.id.toString(),
                        studentId: item.student?.user?.id,
                        studentName: item.student?.name || item.username,
                        rollNumber: item.student?.registerNumber,
                        category: item.category,
                        purpose: item.reason,
                        fromDate: item.fromDate,
                        toDate: item.toDate,
                        status: status,
                        parentPhoneNumber: item.student?.parentPhoneNumber,
                        createdAt: new Date().toISOString(),
                        history: history
                    };
                });
            } catch (e) {
                console.warn("Fetch advisor requests failed:", e);
                return [];
            }
        },

        create: async (formData: FormData) => {
            const response = await fetch(`${API_BASE_URL}/leave/apply`, {
                method: 'POST',
                body: formData,
            });
            return response.text();
        },

        updateStatus: async (id: string, status: string, comment?: string) => {
            const response = await fetch(`${API_BASE_URL}/leave/${id}/status?status=${encodeURIComponent(status)}`, {
                method: 'PUT'
            });
            if (!response.ok) throw new Error("Failed to update status");
            return response.json();
        },

        delete: async (id: string) => {
            const response = await fetch(`${API_BASE_URL}/leave/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error("Failed to delete request");
            return response.text();
        }
    },

    students: {
        getProfile: async (userId: string) => {
            const response = await fetch(`${API_BASE_URL}/students/profile/${userId}`);
            if (!response.ok) return null;
            return response.json();
        },

        getRequests: async (userId: string) => {
            const response = await fetch(`${API_BASE_URL}/students/profile/${userId}/requests`);
            if (!response.ok) return [];
            const data = await response.json();

            // Map Backend Entity to Frontend Interface (same logic as getAll)
            return data.map((item: any) => {
                let status = item.status;
                if (status === 'PENDING_ADVISOR') status = RequestStatus.PENDING_ADVISOR;
                else if (status === 'PENDING_HOD') status = RequestStatus.PENDING_HOD;
                else if (status === 'PENDING_PRINCIPAL') status = RequestStatus.PENDING_PRINCIPAL;
                else if (status === 'APPROVED' || status === 'Approved') status = RequestStatus.APPROVED;
                else if (status === 'REJECTED' || status === 'Rejected') status = RequestStatus.REJECTED;

                const history: any[] = [{ role: UserRole.STUDENT, action: 'Submitted', timestamp: item.createdAt || new Date().toISOString() }];

                if (status === RequestStatus.PENDING_HOD) {
                    history.push({ role: UserRole.ADVISOR, action: 'Approved', timestamp: new Date().toISOString() });
                } else if (status === RequestStatus.PENDING_PRINCIPAL) {
                    history.push({ role: UserRole.ADVISOR, action: 'Approved', timestamp: new Date().toISOString() });
                    history.push({ role: UserRole.HOD, action: 'Approved', timestamp: new Date().toISOString() });
                } else if (status === RequestStatus.APPROVED) {
                    history.push({ role: UserRole.ADVISOR, action: 'Approved', timestamp: new Date().toISOString() });
                    history.push({ role: UserRole.HOD, action: 'Approved', timestamp: new Date().toISOString() });
                    history.push({ role: UserRole.PRINCIPAL, action: 'Approved', timestamp: new Date().toISOString() });
                } else if (status === RequestStatus.REJECTED) {
                    history.push({ role: UserRole.ADVISOR, action: 'Rejected', comment: "Request Rejected", timestamp: new Date().toISOString() });
                }

                return {
                    id: item.id.toString(),
                    studentId: item.student?.user?.id,
                    studentName: item.student?.name || item.username,
                    rollNumber: item.student?.registerNumber,
                    category: item.category,
                    purpose: item.reason,
                    fromDate: item.fromDate,
                    toDate: item.toDate,
                    status: status,
                    parentPhoneNumber: item.student?.parentPhoneNumber,
                    createdAt: new Date().toISOString(),
                    history: history
                };
            });
        },

        updateProfile: async (userId: string, profileData: any) => {
            const response = await fetch(`${API_BASE_URL}/students/profile/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });
            if (!response.ok) throw new Error("Failed to update profile");
            return response.json();
        },

        uploadProfilePicture: async (userId: string, file: File) => {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/students/profile/${userId}/picture`, {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error("Failed to upload profile picture");
            return response.text();
        }
    }
};
