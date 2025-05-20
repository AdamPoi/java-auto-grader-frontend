import { Link } from "@tanstack/react-router"
import menuItems from '@/data/menu-items.json'
import DynamicIcon from '../ui/DynamicIcon'
import { useAuthStore } from "@/stores/auth.store"

export interface MenuItem {
    name: string
    url: string
    icon?: string
    role?: string | null
}

interface NavigationMenuProps {
    className?: string
    mobile?: boolean
}

export function NavigationMenu({ className = '', mobile = false }: NavigationMenuProps) {
    const { user } = useAuthStore()
    return (
        <>
            {menuItems.filter(item => item.role == null || item.role === user?.role).map((item) => (
                <Link
                    key={item.url}
                    to={item.url}
                    className={`inline-flex items-center ${mobile ?
                        'pl-3 pr-4 py-2 text-base font-medium' :
                        'px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5'
                        } text-gray-500 hover:text-gray-700 ${!mobile && 'hover:border-gray-300'} focus:outline-none focus:text-gray-700 ${!mobile && 'focus:border-gray-300'} transition duration-150 ease-in-out ${className}`}
                >
                    {item.icon && (
                        <DynamicIcon
                            icon={item.icon}
                            size={mobile ? "1.25em" : "1em"}
                            color="currentColor"
                            fallback={null}
                        />
                    )}
                    <span className={mobile ? 'ml-2' : 'ml-1'}>{item.name}</span>
                </Link>
            ))}
        </>
    )
}