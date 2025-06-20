import {
  IconBook,
  IconChalkboard,
  IconChalkboardTeacher,
  IconClipboardCheck,
  IconCode,
  IconFileCode,
  IconLayoutDashboard,
  IconSchool,
  IconShield,
  IconUsers
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },

  navGroups: [

    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard,
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
        },
        {
          title: 'Roles',
          url: '/roles',
          icon: IconShield,
        },
        // {
        //   title: 'Students',
        //   url: '/students',
        //   icon: IconSchool,
        // },
        // {
        //   title: 'Teachers',
        //   url: '/teachers',
        //   icon: IconChalkboardTeacher,
        // },
        {
          title: 'Classrooms',
          url: '/classrooms',
          icon: IconChalkboard,
        },
        {
          title: 'Courses',
          url: '/courses',
          icon: IconBook,
        },
        {
          title: 'Submissions',
          url: '/submissions',
          icon: IconClipboardCheck,
        },
      ],
    },

    {
      title: 'Assignment',
      items: [
        {
          title: 'Compiler',
          url: '/assignments/compiler',
          icon: IconCode,
        },
        {
          title: 'Test Builder',
          url: '/assignments/test-builder',
          icon: IconFileCode,
        },
      ]
    },
    // {
    //   title: 'Pages',
    //   items: [
    //     {
    //       title: 'Auth',
    //       icon: IconLockAccess,
    //       items: [
    //         {
    //           title: 'Login',
    //           url: '/login',
    //         },

    //       ],
    //     },
    //     {
    //       title: 'Errors',
    //       icon: IconBug,
    //       items: [
    //         {
    //           title: 'Unauthorized',
    //           url: '/401',
    //           icon: IconLock,
    //         },
    //         {
    //           title: 'Forbidden',
    //           url: '/403',
    //           icon: IconUserOff,
    //         },
    //         {
    //           title: 'Not Found',
    //           url: '/404',
    //           icon: IconError404,
    //         },
    //         {
    //           title: 'Internal Server Error',
    //           url: '/500',
    //           icon: IconServerOff,
    //         },
    //         {
    //           title: 'Maintenance Error',
    //           url: '/503',
    //           icon: IconBarrierBlock,
    //         },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   title: 'Other',
    //   items: [
    //     {
    //       title: 'Settings',
    //       icon: IconSettings,
    //       items: [
    //         {
    //           title: 'Profile',
    //           url: '/settings',
    //           icon: IconUserCog,
    //         },
    //         {
    //           title: 'Account',
    //           url: '/settings/account',
    //           icon: IconTool,
    //         },
    //         {
    //           title: 'Appearance',
    //           url: '/settings/appearance',
    //           icon: IconPalette,
    //         },
    //         {
    //           title: 'Notifications',
    //           url: '/settings/notifications',
    //           icon: IconNotification,
    //         },
    //         {
    //           title: 'Display',
    //           url: '/settings/display',
    //           icon: IconBrowserCheck,
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Help Center',
    //       url: '/help-center',
    //       icon: IconHelp,
    //     },
    //   ],
    // },
  ],
}
