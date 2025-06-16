import {
  IconChalkboardTeacher,
  IconSchool,
  IconUserShield
} from '@tabler/icons-react'
import { type UserStatus } from './types'

export const statusTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10'],
])

export const userTypes = [

  {
    label: 'Admin',
    value: 'admin',
    icon: IconUserShield,
  },
  {
    label: 'Student',
    value: 'student',
    icon: IconSchool
  },
  {
    label: 'Teacher',
    value: 'teacher',
    icon: IconChalkboardTeacher,
  },
] as const
