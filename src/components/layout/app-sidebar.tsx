import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth.store'
import { IconCoffee } from '@tabler/icons-react'
import { sidebarData } from './data/sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { auth } = useAuthStore()
  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">

          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
            <IconCoffee className='size-5' />

          </div>
          <div className='grid flex-1 text-left text-lg leading-tight'>
            <span className='truncate font-semibold'>
              Koreksi Rek
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={auth.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
