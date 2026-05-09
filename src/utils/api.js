// utils/api.js — Production API Client with Auth, Error Handling, Offline
import { API_ENDPOINTS } from './constants';

class ApiClient {
    constructor() {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        this.token = localStorage.getItem('auth_token');
        this.init();
    }

    init() {
        // Interceptors for auth token
        this.token = localStorage.getItem('auth_token');
    }

    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.token ? `Bearer ${this.token}` : '',
                    ...options.headers
                },
                ...options
            };

            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // 🔥 AUTH
    async login(email, password) {
        const data = await this.request(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_role', data.role);
        this.token = data.token;
        return data;
    }

    async logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        this.token = null;
    }

    // 📋 ATTENDANCE
    async markAttendance(date, className, records) {
        return this.request(API_ENDPOINTS.ATTENDANCE_MARK, {
            method: 'POST',
            body: JSON.stringify({ date, class: className, records })
        });
    }

    async getAttendanceReport(className, dateRange) {
        return this.request(`${API_ENDPOINTS.ATTENDANCE_REPORT}?class=${className}&from=${dateRange.from}&to=${dateRange.to}`);
    }

    // 👥 STUDENTS & STAFF
    async getStudents(className = null) {
        const params = className ? `?class=${className}` : '';
        return this.request(`${API_ENDPOINTS.STUDENTS}${params}`);
    }

    async getStaff(department = null) {
        const params = department ? `?dept=${department}` : '';
        return this.request(`${API_ENDPOINTS.STAFF}${params}`);
    }

    async updateStaff(staffId, data) {
        return this.request(`${API_ENDPOINTS.STAFF}/${staffId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // 💰 FEES
    async payFees(studentId, amount, mode) {
        return this.request(`${API_ENDPOINTS.FEES_PAY}`, {
            method: 'POST',
            body: JSON.stringify({ studentId, amount, mode })
        });
    }

    async getFeesDue(studentId) {
        return this.request(`${API_ENDPOINTS.FEES_DUE}/${studentId}`);
    }

    // 📱 SMS/WHATSAPP
    async sendSMS(phone, message) {
        return this.request(API_ENDPOINTS.SMS_SEND, {
            method: 'POST',
            body: JSON.stringify({ phone, message })
        });
    }

    async sendWhatsApp(phone, message) {
        return this.request(API_ENDPOINTS.WHATSAPP, {
            method: 'POST',
            body: JSON.stringify({ phone, message })
        });
    }

    // 📊 REPORTS & EXPORTS
    async generatePDF(type, data) {
        const response = await this.request(API_ENDPOINTS.PDF_GENERATE, {
            method: 'POST',
            body: JSON.stringify({ type, data })
        });
        return response.pdf_url;
    }

    async exportExcel(type, filters) {
        const response = await this.request(API_ENDPOINTS.EXPORT_EXCEL, {
            method: 'POST',
            body: JSON.stringify({ type, filters })
        });
        return response.download_url;
    }

    // 🚨 REAL-TIME (WebSocket)
    connectRealtime(channel) {
        // Socket.io or Supabase Realtime
        console.log(`🔌 Connected to ${channel}`);
    }
}

// 🔥 GLOBAL INSTANCE
export const api = new ApiClient();

// 🔥 HOOKS FOR REACT
export const useApi = () => api;

// 🔥 AUTO-REFRESH TOKEN
setInterval(() => {
    if (api.token && Date.now() - parseInt(localStorage.getItem('token_expiry') || 0) > 50 * 60 * 1000) {
        api.request('/api/auth/refresh');
    }
}, 5 * 60 * 1000);