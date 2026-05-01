const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

let authToken = null;

export const setAuthToken = (token) => {
    authToken = token || null;
    if (typeof window !== 'undefined') {
        if (token) window.localStorage.setItem('dvp_auth_token', token);
        else window.localStorage.removeItem('dvp_auth_token');
    }
};

export const getStoredToken = () => {
    if (authToken) return authToken;
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('dvp_auth_token');
};

const request = async (path, options = {}) => {
    const token = options.token ?? getStoredToken();
    const headers = new Headers(options.headers || {});

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    let response;
    try {
        response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers,
        });
    } catch (networkErr) {
        // Server unreachable (not running, DNS failure, CORS, etc.)
        throw new Error('Unable to reach the server. Please try again later.');
    }

    let payload = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        payload = await response.json();
    } else {
        payload = await response.text();
    }

    if (!response.ok) {
        const message =
            (payload && typeof payload === 'object' && payload.error) ||
            (typeof payload === 'string' && payload) ||
            'Request failed';
        throw new Error(message);
    }

    return payload;
};

export const api = {
    async getBooks(params = {}) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.set(key, String(value));
            }
        });
        const suffix = searchParams.toString() ? `?${searchParams}` : '';
        return request(`/api/books${suffix}`, { headers: {}, token: null });
    },

    async getBookById(id) {
        return request(`/api/books/${id}`, { token: null });
    },

    async login(email, password) {
        return request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    async register(name, email, password) {
        return request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    },

    async getCurrentUser(token) {
        return request('/api/auth/me', { token });
    },

    async getMySubmissions() {
        return request('/api/auth/submissions');
    },

    async getAdminSubmissions() {
        return request('/api/admin/submissions');
    },

    async getAuditLog() {
        return request('/api/admin/audit');
    },

    async getAdminMetrics() {
        return request('/api/admin/metrics');
    },

    async updateSubmission(id, data) {
        return request(`/api/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteSubmission(id) {
        return request(`/api/books/${id}`, {
            method: 'DELETE',
        });
    },

    async createSubmission(data) {
        return request('/api/submissions', {
            method: 'POST',
            body: JSON.stringify(data),
            token: null,
        });
    },

    async uploadImage(file, folder = 'dvp/covers') {
        const form = new FormData();
        form.append('file', file);
        form.append('folder', folder);
        return request('/api/upload/image', {
            method: 'POST',
            body: form,
            headers: {},
            token: null,
        });
    },

    async uploadDocument(file, folder = 'dvp/documents') {
        const form = new FormData();
        form.append('file', file);
        form.append('folder', folder);
        return request('/api/upload/document', {
            method: 'POST',
            body: form,
            headers: {},
            token: null,
        });
    },

    async createContactLead(data) {
        return request('/api/contact', {
            method: 'POST',
            body: JSON.stringify(data),
            token: null,
        });
    },

    async subscribeNewsletter(data) {
        return request('/api/newsletter', {
            method: 'POST',
            body: JSON.stringify(data),
            token: null,
        });
    },
};
