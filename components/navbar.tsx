"use client"

import { useState } from "react"
import { Home, User, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import AuthModal from "./auth-modal"
import Link from "next/link"

export default function Navbar() {
  const { user, signOut, loading } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/profile", label: "Mi Perfil", icon: User },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-green-500">TRIBUNEROS</div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-300 hover:text-green-500 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-green-600 text-black font-semibold">
                      {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-300">{user.username || user.email}</span>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-black font-semibold"
                >
                  Iniciar Sesión
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-800 py-4">
              <div className="space-y-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 text-gray-300 hover:text-green-500 transition-colors px-2 py-2"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}

                <div className="border-t border-gray-800 pt-4">
                  {loading ? (
                    <div className="flex items-center space-x-3 px-2">
                      <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
                      <div className="w-24 h-4 bg-gray-800 rounded animate-pulse" />
                    </div>
                  ) : user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 px-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-green-600 text-black font-semibold">
                            {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-300">{user.username || user.email}</span>
                      </div>
                      <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Cerrar Sesión
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setAuthModalOpen(true)
                        setMobileMenuOpen(false)
                      }}
                      className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
                    >
                      Iniciar Sesión
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  )
}
