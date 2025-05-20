import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { NavigationMenu } from "../molecules/navigation-menu"


export function Header() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()
    const title = import.meta.env.VITE_APP_NAME

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm">
            {/* Primary Header Menu */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        {/* Logo */}
                        <div className="shrink-0 flex items-center">
                            <Link to="/dashboard" className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-indigo-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                                <span className="ml-2 text-lg font-semibold text-indigo-600">
                                    {title}
                                </span>
                            </Link>
                        </div>

                        {/* Header Links */}
                        <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                            <NavigationMenu />
                        </div>

                    </div>

                    {/* Settings Dropdown */}
                    {user &&
                        <div className="hidden sm:flex sm:items-center sm:ms-6">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-600 bg-white hover:text-indigo-600 focus:outline-none transition ease-in-out duration-150">
                                        <div className="flex items-center">
                                            <img
                                                className="h-8 w-8 rounded-full object-cover mr-2 border border-gray-200"
                                                src="https://randomuser.me/api/portraits/men/32.jpg"
                                                alt="Profile photo"
                                            />
                                            <div>{user?.name}</div>
                                        </div>
                                        <div className="ms-1">
                                            <svg
                                                className="fill-current h-4 w-4"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <div className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
                                        <div className="font-semibold">{user?.name}</div>
                                        <div className="text-xs">{user?.email}</div>
                                    </div>
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile" className="flex items-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                            Profil Saya
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="flex items-center text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                            />
                                        </svg>
                                        <span onClick={() => {
                                            logout()
                                            navigate({ to: '/login' })
                                        }}>
                                            Keluar
                                        </span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    }

                    {/* Hamburger */}
                    <div className="-me-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setOpen(!open)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-indigo-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-indigo-500 transition duration-150 ease-in-out"
                        >
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    className={!open ? "inline-flex" : "hidden"}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                                <path
                                    className={open ? "inline-flex" : "hidden"}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Responsive Header Menu */}
            <div className={open ? "block" : "hidden sm:hidden"}>
                <div className="pt-2 pb-3 space-y-1">
                    <NavigationMenu mobile />
                </div>

                {/* Responsive Settings Options */}
                {user &&
                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="px-4 flex items-center">
                            <div className="flex-shrink-0">
                                <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src="https://randomuser.me/api/portraits/men/32.jpg"
                                    alt="Profile photo"
                                />
                            </div>
                            <div className="ml-3">
                                <div className="font-medium text-base text-gray-800">
                                    {user?.name}
                                </div>
                                <div className="font-medium text-sm text-gray-500">
                                    {user?.email}
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <Link
                                to="/profile"
                                className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none focus:text-gray-800 focus:bg-gray-50 transition duration-150 ease-in-out"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                Profil Saya
                            </Link>
                            <button
                                onClick={() => {
                                    logout()
                                    navigate({ to: '/login' })
                                }}
                                className="flex items-center w-full pl-3 pr-4 py-2 text-base font-medium text-red-500 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:text-red-700 focus:bg-red-50 transition duration-150 ease-in-out"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                                Keluar
                            </button>
                        </div>
                    </div>
                }
            </div>
        </nav>
    )
}

