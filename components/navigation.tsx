"use client"

import { Home, Search, Bell, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Inicio", href: "/" },
    { icon: Search, label: "Explorar", href: "/explore" },
    { icon: Bell, label: "Notificaciones", href: "/notifications" },
    { icon: User, label: "Perfil", href: "/profile" },
    { icon: Users, label: "Comunidad", href: "/community" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md border-t border-gray-800">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-3 px-4 ${
                  isActive ? "text-green-500" : "text-gray-500 hover:text-white"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
