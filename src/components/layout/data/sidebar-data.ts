import { useAuthStore } from '@/stores/auth.store'
import {
  IconBook,
  IconChalkboard,
  IconClipboardCheck,
  IconCode,
  IconFileCode,
  IconLayoutDashboard,
  IconShield,
  IconUsers
} from '@tabler/icons-react'
import { type SidebarData } from '../types'

const { auth } = useAuthStore.getState()

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

    ...(auth.hasRole(['admin']) ? [
      {
        title: 'Data',
        items: [
          {
            title: 'Users',
            url: '/admin/users' as any,
            icon: IconUsers,
          },
          {
            title: 'Roles',
            url: '/admin/roles',
            icon: IconShield,
          },
          {
            title: 'Classrooms',
            url: '/admin/classrooms',
            icon: IconChalkboard,
          },
          {
            title: 'Courses',
            url: '/admin/courses',
            icon: IconBook,
          },
        ]
      },
    ] : []),

    ...(auth.hasRole(['student']) ? [
      {
        title: 'Courses',
        items: [
          {
            title: 'Courses',
            url: '/app/courses',
            icon: IconClipboardCheck,
          },
        ]
      },
    ] : []),

    ...(auth.hasRole(['teacher']) ? [
      {
        title: 'Assignment',
        items: [
          {
            title: 'Courses',
            url: '/admin/courses',
            icon: IconBook,
          },
        ]
      },


    ] : []),
    // {
    //   title: 'Assignment',
    //   items: [
    //     {
    //       title: 'Compiler',
    //       url: '/admin/assignments/compiler',
    //       icon: IconCode,
    //     },
    //     {
    //       title: 'Test Builder',
    //       url: '/admin/assignments/test-builder',
    //       icon: IconFileCode,
    //     },
    //   ]
    // },
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
