"use client"

import { useState } from "react"
import { Home, Calendar, User, Film, BarChart3, Search, LogOut, Menu, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import AuthModal from "./auth-modal"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function NavbarEnhanced() {
  const { user, signOut, loading } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
  }

  const navItems = [
    { href: "/", label: "Inicio", icon: Home, description: "Landing principal" },
    { href: "/today", label: "Partidos de Hoy", icon: Calendar, description: "Partidos del día" },
    { href: "/profile", label: "Mi Perfil", icon: User, description: "Tu perfil personal" },
    { href: "/moments", label: "Momentos", icon: Film, description: "Videos y highlights" },
    { href: "/stats", label: "Estadísticas", icon: BarChart3, description: "Rankings globales" },
    { href: "/search", label: "Buscar", icon: Search, description: "Búsqueda avanzada" },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-green-500">TRIBUNEROS</div>
              <Badge variant="secondary" className="hidden sm:block bg-green-500/20 text-green-400 text-xs">
                Beta
              </Badge>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        active
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "text-gray-300 hover:text-green-500 hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-500 p-2">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-green-600 text-black font-semibold">
                      {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden xl:block">
                    <div className="text-sm font-medium text-white">{user.username || "Usuario"}</div>
                    <div className="text-xs text-gray-400">@{user.username || "user"}</div>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-400 p-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6"
                >
                  Iniciar Sesión
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-400 hover:text-white p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-800 py-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        active
                          ? "bg-green-500/20 text-green-400"
                          : "text-gray-300 hover:text-green-500 hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  )
                })}

                <div className="border-t border-gray-800 pt-4 mt-4">
                  {loading ? (
                    <div className="flex items-center space-x-3 px-4">
                      <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse" />
                      <div className="space-y-2">
                        <div className="w-24 h-4 bg-gray-800 rounded animate-pulse" />
                        <div className="w-16 h-3 bg-gray-800 rounded animate-pulse" />
                      </div>
                    </div>
                  ) : user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 px-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-green-600 text-black font-semibold">
                            {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white">{user.username || "Usuario"}</div>
                          <div className="text-sm text-gray-400">@{user.username || "user"}</div>
                        </div>
                      </div>
                      <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4"
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
                      className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold mx-4"
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
