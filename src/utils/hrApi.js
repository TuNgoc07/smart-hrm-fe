/**
 * HR Admin API Utility
 *
 * Centralizes all /api/hradmin/* calls for HR Admin screens.
 * Auth: Bearer token from localStorage.getItem("token")
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
}

// ── Document Checklists ───────────────────────────────────────────────────

export async function fetchChecklistTemplates() {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/templates`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Templates fetch failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : [];
}

export async function fetchChecklistTemplateDetail(templateId) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/templates/${templateId}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Template detail fetch failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}

export async function createChecklistTemplate(name, description, items) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/templates`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, description, items }),
    });
    if (!res.ok) throw new Error(`Template creation failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}

export async function updateChecklistTemplate(templateId, name, description, isActive) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/templates/${templateId}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ name, description, isActive }),
    });
    if (!res.ok) throw new Error(`Template update failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}

export async function fetchChecklistAssignments() {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/assignments`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Assignments fetch failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : [];
}

export async function fetchChecklistAssignmentDetail(assignmentId) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/assignments/${assignmentId}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Assignment detail fetch failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}

export async function assignChecklist(employeeId, templateId, dueDate) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/assignments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ employeeId, templateId, dueDate }),
    });
    if (!res.ok) throw new Error(`Assignment failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}

export async function reviewChecklistResponse(responseId, status, notes) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/responses/${responseId}/review`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) throw new Error(`Review failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}
