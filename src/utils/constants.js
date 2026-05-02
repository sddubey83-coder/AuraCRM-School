// utils/constants.js — Enterprise Constants
export const COLORS = {
    bg: '#0d1117', card: '#111827', border: '#1f2d3d',
    text: '#f1f5f9', muted: '#6b7280', subtle: '#9ca3af',
    primary: '#4e8ef7', success: '#00d97e', warning: '#f6c90e',
    danger: '#f45b69', info: '#a78bfa', orange: '#f97316'
};

export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/api/auth/login',
    STUDENTS: '/api/students',
    STAFF: '/api/staff',

    // Attendance
    ATTENDANCE_MARK: '/api/attendance/mark',
    ATTENDANCE_REPORT: '/api/attendance/report',

    // Fees
    FEES_PAY: '/api/fees/pay',
    FEES_DUE: '/api/fees/due',

    // SMS/WhatsApp
    SMS_SEND: '/api/sms/send',
    WHATSAPP: '/api/whatsapp/send',

    // Reports
    PDF_GENERATE: '/api/pdf/generate',
    EXPORT_EXCEL: '/api/export/excel'
};

export const SCHOOL_CONFIG = {
    name: 'AuraSync School',
    affiliation: 'MP-2024-AI-001',
    location: 'Indore, MP',
    contact: '+91-9876543210',
    session: '2024-25'
};

export const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11-Commerce', '11-Science', '11-Arts', '12-Commerce', '12-Science', '12-Arts'];

export const DEPARTMENTS = ['Teaching', 'Administration', 'Support', 'Library', 'Transport'];

export const LEAVE_TYPES = ['CL', 'EL', 'ML', 'Half Day', 'Maternity', 'LWP', 'Compensatory'];

export const PAYROLL_CONFIG = {
    allowances: { DA: 12, HRA: 8, TA: 5, Medical: 1250, Special: 2000 },
    deductions: { PF: 12, ESI: 1.75, ProfessionalTax: 200, TDS: 10 }
};

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    PRINCIPAL: 'principal',
    TEACHER: 'teacher',
    PARENT: 'parent',
    STUDENT: 'student'
};