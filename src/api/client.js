// Backend ka base URL (Technical Contract v1.0 ke according)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Reusable fetch wrapper jo response aur errors check karega
async function request(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    });

    const result = await response.json();

    // Agar backend ne success: false bheja ya HTTP error hua
    if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Something went wrong with the API request");
    }

    return result.data;
}

// 1. Meeting details, transcripts, aur tasks load karna
export async function fetchMeetingById(meetingId) {
    return request(`/meetings/${meetingId}`);
}

// 2. Manager ka task approve karna
export async function approveTaskApi(taskId, payload) {
    return request(`/tasks/${taskId}/approve`, {
        method: "PATCH",
        body: JSON.stringify(payload), // { assigneeId, approvedDeadlineAt, title, description }
    });
}

// 3. Manager ka task reject karna
export async function rejectTaskApi(taskId) {
    return request(`/tasks/${taskId}/reject`, {
        method: "PATCH",
    });
}

// 4. Employee ka apna work status update karna
export async function updateTaskStatusApi(taskId, workStatus) {
    return request(`/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ workStatus }), // "not_started" | "in_progress" | "blocked" | "completed"
    });
}