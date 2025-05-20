import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth.store'
import { useNavigate } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import menuItems from '@/data/dropdown-menu.json'
import type { ReactNode } from 'react'
import DynamicIcon from '../ui/DynamicIcon'

export interface MenuItem {
    name: string
    url: string
    icon?: ReactNode
    role?: string | null
}
function getMenuItems(userRole?: string): MenuItem[] {
    return menuItems
        .filter(item => item.role == null || item.role === userRole)
        .map((item) => {

            return {
                ...item,
                icon: item.icon ? <DynamicIcon icon={item.icon} size="2em" color="black" fallback={null} /> : undefined
            }
        })
}

export function NavigationDropdown() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const filteredItems = getMenuItems(user?.role)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1">
                Navigation <ChevronDown size={16} />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
                {filteredItems.map((item) => (
                    <DropdownMenuItem
                        key={item.url}
                        onClick={() => navigate({ to: item.url })}
                        className="flex items-center gap-2"
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}