import {
  LayoutDashboard,
  Calendar,
  User,
  FileText,
  Heart,
  Stethoscope,
  Users,
  Clock,
  DollarSign,
  Settings,
  BarChart,
  Shield,
  Video,
  MessageSquare,
  Award,
  Activity,
  Briefcase,
  LogOut,
  Bell,
  Star,
  CreditCard,
  TrendingUp,
  Home
} from 'lucide-react'

export const menuConfig = {
  patient: {
    main: [
      {
        name: 'Dashboard',
        href: '/patient',
        icon: LayoutDashboard,
        badge: null,
        permissions: ['patient']
      },
      {
        name: 'Appointments',
        href: '/patient/appointments',
        icon: Calendar,
        badge: 'upcoming',
        permissions: ['patient'],
        submenu: [
          { name: 'All Appointments', href: '/patient/appointments' },
          { name: 'Book New', href: '/patient/appointments/book' },
          { name: 'Upcoming', href: '/patient/appointments?status=upcoming' },
          { name: 'Past', href: '/patient/appointments?status=past' }
        ]
      },
      {
        name: 'Find Doctors',
        href: '/patient/doctors',
        icon: Stethoscope,
        badge: null,
        permissions: ['patient']
      },
      {
        name: 'Prescriptions',
        href: '/patient/prescriptions',
        icon: FileText,
        badge: 'new',
        permissions: ['patient']
      },
      {
        name: 'Favorites',
        href: '/patient/favorites',
        icon: Heart,
        badge: null,
        permissions: ['patient']
      },
      {
        name: 'Profile',
        href: '/patient/profile',
        icon: User,
        badge: null,
        permissions: ['patient']
      }
    ],
    secondary: [
      {
        name: 'Messages',
        href: '/patient/messages',
        icon: MessageSquare,
        badge: '3'
      },
      {
        name: 'Notifications',
        href: '/patient/notifications',
        icon: Bell,
        badge: '5'
      },
      {
        name: 'Settings',
        href: '/patient/settings',
        icon: Settings
      }
    ]
  },

  doctor: {
    main: [
      {
        name: 'Dashboard',
        href: '/doctor',
        icon: LayoutDashboard,
        badge: null,
        permissions: ['doctor']
      },
      {
        name: 'Appointments',
        href: '/doctor/appointments',
        icon: Calendar,
        badge: 'today',
        permissions: ['doctor'],
        submenu: [
          { name: "Today's Schedule", href: '/doctor/appointments/today' },
          { name: 'All Appointments', href: '/doctor/appointments' },
          { name: 'Pending', href: '/doctor/appointments?status=pending' },
          { name: 'Completed', href: '/doctor/appointments?status=completed' }
        ]
      },
      {
        name: 'My Patients',
        href: '/doctor/patients',
        icon: Users,
        badge: null,
        permissions: ['doctor']
      },
      {
        name: 'Schedule',
        href: '/doctor/schedule',
        icon: Clock,
        badge: null,
        permissions: ['doctor']
      },
      {
        name: 'Prescriptions',
        href: '/doctor/prescriptions',
        icon: FileText,
        badge: null,
        permissions: ['doctor']
      },
      {
        name: 'Earnings',
        href: '/doctor/earnings',
        icon: DollarSign,
        badge: 'new',
        permissions: ['doctor']
      },
      {
        name: 'Reviews',
        href: '/doctor/reviews',
        icon: Star,
        badge: null,
        permissions: ['doctor']
      },
      {
        name: 'Complete Profile',
        href: '/doctor/complete-profile',
        icon: User,
        badge: null,
        permissions: ['doctor']
      }, 
      {
        name: 'Profile',
        href: '/doctor/profile',
        icon: User,
        badge: null,
        permissions: ['doctor']
      }
    ],
    secondary: [
      {
        name: 'Video Calls',
        href: '/doctor/video',
        icon: Video,
        badge: '1'
      },
      {
        name: 'Messages',
        href: '/doctor/messages',
        icon: MessageSquare,
        badge: '2'
      },
      {
        name: 'Analytics',
        href: '/doctor/analytics',
        icon: TrendingUp
      },
      {
        name: 'Settings',
        href: '/doctor/settings',
        icon: Settings
      }
    ]
  },

  admin: {
    main: [
      {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        badge: null,
        permissions: ['admin', 'superadmin']
      },
      {
        name: 'User Management',
        href: '/admin/users',
        icon: Users,
        badge: null,
        permissions: ['admin', 'superadmin'],
        submenu: [
          { name: 'All Users', href: '/admin/users' },
          { name: 'Patients', href: '/admin/users?role=patient' },
          { name: 'Doctors', href: '/admin/users?role=doctor' },
          { name: 'Admins', href: '/admin/users?role=admin' }
        ]
      },
      {
        name: 'Doctor Verification',
        href: '/admin/doctors/verification',
        icon: Shield,
        badge: 'pending',
        permissions: ['admin', 'superadmin']
      },
      {
        name: 'Appointments',
        href: '/admin/appointments',
        icon: Calendar,
        badge: null,
        permissions: ['admin', 'superadmin']
      },
      {
        name: 'Payments',
        href: '/admin/payments',
        icon: CreditCard,
        badge: null,
        permissions: ['admin', 'superadmin'],
        submenu: [
          { name: 'Transactions', href: '/admin/payments' },
          { name: 'Withdrawals', href: '/admin/payments/withdrawals' },
          { name: 'Refunds', href: '/admin/payments/refunds' }
        ]
      },
      {
        name: 'Reports',
        href: '/admin/reports',
        icon: BarChart,
        badge: null,
        permissions: ['admin', 'superadmin'],
        submenu: [
          { name: 'Revenue Report', href: '/admin/reports/revenue' },
          { name: 'Doctor Report', href: '/admin/reports/doctors' },
          { name: 'Patient Report', href: '/admin/reports/patients' },
          { name: 'Appointment Report', href: '/admin/reports/appointments' }
        ]
      },
      {
        name: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        badge: null,
        permissions: ['superadmin']
      }
    ],
    secondary: [
      {
        name: 'Activity Logs',
        href: '/admin/logs',
        icon: Activity
      },
      {
        name: 'System Health',
        href: '/admin/health',
        icon: Award
      },
      {
        name: 'Support',
        href: '/admin/support',
        icon: MessageSquare
      }
    ]
  },

  // Common menu items for all roles
  common: {
    bottom: [
      {
        name: 'Help & Support',
        href: '/support',
        icon: MessageSquare
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings
      }
    ]
  }
}