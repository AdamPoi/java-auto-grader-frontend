import { useForm } from "react-hook-form"
import { loginSchema, type LoginSchema } from "@/schemas/auth.validation.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from "@/stores/auth.store"

import LoginIllustration from "@/assets/images/login-illustration.svg"

export const Route = createFileRoute('/_guestLayout/login')({
    component: LoginPage,
})
function LoginPage() {
    const { login, authError } = useAuthStore()
    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },

    })

    async function onSubmit(values: LoginSchema) {
        await login(values)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Left side - Image illustration */}
                    <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 p-8">
                        <div className="flex flex-col h-full">
                            <div className="flex-grow flex items-center justify-center">
                                <img src={LoginIllustration} alt="Login illustration"
                                    className="w-full max-w-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Right side - Login form */}
                    <div className="w-full md:w-1/2 p-8">
                        <div className="sm:mx-auto sm:w-full">
                            <div className="flex justify-center md:hidden">
                                <svg className="h-14 w-auto text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                </svg>
                            </div>
                            <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
                                Selamat Datang Kembali
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                Masuk untuk melanjutkan ke repositori skripsi
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="block text-sm font-medium text-gray-700">Email</FormLabel>
                                            <FormControl>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20" fill="currentColor">
                                                            <path
                                                                d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                        </svg>
                                                    </div>
                                                    <Input
                                                        className="block w-full pl-10 py-3 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                        placeholder="nama@contoh.com"
                                                        type="email"
                                                        autoComplete="username"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            {authError && <FormMessage className="mt-2 text-sm text-red-600">{authError}</FormMessage>}
                                        </FormItem>
                                    )}
                                />

                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel className="block text-sm font-medium text-gray-700">Password</FormLabel>
                                                <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-150">
                                                    Lupa password?
                                                </a>
                                            </div>
                                            <FormControl>
                                                <div className="mt-1 relative rounded-md shadow-sm">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd"
                                                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                                clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <Input
                                                        className="block w-full pl-10 py-3 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                        placeholder="••••••••"
                                                        type="password"
                                                        autoComplete="current-password"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            {authError && <FormMessage className="mt-2 text-sm text-red-600">{authError}</FormMessage>}
                                        </FormItem>
                                    )}
                                />

                                {/* Remember Me */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors duration-150" />
                                        <span className="ms-2 text-sm text-gray-600">Ingat saya</span>
                                    </label>
                                </div>

                                <Button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]">
                                    Masuk
                                </Button>
                            </form>
                        </Form>

                        {/* Registration link */}
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Atau</span>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Belum memiliki akun?
                                    <a href="/register"
                                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-150 ml-1">
                                        Daftar sekarang
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
