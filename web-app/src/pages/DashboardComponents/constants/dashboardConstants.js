// Dashboard types
export const DASHBOARD_TYPES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    NURSE: 'nurse'
  };
  
  // Dashboard views
  export const DASHBOARD_VIEWS = {
    OVERVIEW: 'overview',
    PATIENTS: 'patients',
    STAFF: 'staff',
    ANALYTICS: 'analytics',
    SCHEDULE: 'schedule'
  };
  
  // Patient statuses
  export const PATIENT_STATUS = {
    PUBLISHED: 'Published',
    MONITORING: 'Monitoring',
    REVIEW: 'Review',
    COMPLETED: 'Completed'
  };
  
  // Filter types
  export const FILTER_TYPES = {
    TOTAL: 'total',
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    CUSTOM: 'custom'
  };
  
  // Chart colors
  export const CHART_COLORS = {
    PRIMARY: ['#1E40AF', '#4338CA', '#312E81', '#1E3A8A'],
    SUCCESS: ['#047857', '#059669', '#10B981', '#34D399'],
    DANGER: ['#B91C1C', '#DC2626', '#EF4444', '#F87171'],
    WARNING: ['#B45309', '#D97706', '#F59E0B', '#FBBF24'],
    INFO: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD']
  };
  
  // Status configurations
  export const STATUS_CONFIG = {
    DOCTORS: {
      Online: { label: 'Online', color: '#34D399' },
      Offline: { label: 'Offline', color: '#F87171' }
    },
    NURSES: {
      Online: { label: 'Online', color: '#34D399' },
      Offline: { label: 'Offline', color: '#F87171' }
    },
    PATIENTS: {
      New: { label: 'New Patients', color: '#3B82F6' },
      Existing: { label: 'Existing Patients', color: '#4338CA' }
    }
  };
  
  // Time periods for filtering
  export const TIME_PERIODS = [
    { id: FILTER_TYPES.TODAY, label: 'Today' },
    { id: FILTER_TYPES.WEEK, label: 'This Week' },
    { id: FILTER_TYPES.MONTH, label: 'This Month' },
    { id: FILTER_TYPES.TOTAL, label: 'All Time' }
  ];
  
  // Grid layout configurations
  export const GRID_LAYOUTS = {
    SINGLE: 'grid-cols-1',
    DOUBLE: 'grid-cols-1 md:grid-cols-2',
    TRIPLE: 'grid-cols-1 md:grid-cols-3',
    QUADRUPLE: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };
  
  // API endpoints
  export const API_ENDPOINTS = {
    DOCTOR_DETAIL: (id) => `/doctors/${id}`,
    DOCTOR_PATIENTS: (id) => `/doctors/${id}/patients`,
    ADMIN_DOCTORS: '/dashboard/doctors',
    ADMIN_NURSES: '/dashboard/nurses',
    ADMIN_PATIENTS: '/dashboard/patients',
    PATIENT_COUNT: '/patients/count'
  };
  
  // Error messages
  export const ERROR_MESSAGES = {
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'There was a problem with the server. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    UNAUTHORIZED: 'You are not authorized to access this resource.',
    GENERAL: 'An error occurred. Please try again.'
  };
  
  // Dashboard sections configuration
  export const DASHBOARD_SECTIONS = {
    SUMMARY: {
      id: 'summary',
      title: 'Summary'
    },
    PATIENT_STATUS: {
      id: 'patientStatus',
      title: 'Patient Status'
    },
    STAFF_STATUS: {
      id: 'staffStatus',
      title: 'Staff Status'
    },
    DISEASE_CATEGORIES: {
      id: 'diseaseCategories',
      title: 'Disease Categories'
    },
    RECENT_ACTIVITY: {
      id: 'recentActivity',
      title: 'Recent Activity'
    }
  };
  
  // Date formats
  export const DATE_FORMATS = {
    DISPLAY: 'MMM d, yyyy',
    API: 'yyyy-MM-dd',
    TOOLTIP: 'MMM d, yyyy h:mm a'
  };