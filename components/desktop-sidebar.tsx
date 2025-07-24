import { Home, Search, Bell, User, Users, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function DesktopSidebar() {
  const menuItems = [
    { icon: Home, label: "Inicio", href: "/", active: true },
    { icon: Search, label: "Explorar", href: "/explore" },
    { icon: Bell, label: "Notificaciones", href: "/notifications" },
    { icon: User, label: "Perfil", href: "/profile" },
    { icon: Users, label: "Comunidad", href: "/community" },
    { icon: Settings, label: "Configuración", href: "/settings" },
  ]

  return (
    <div className="w-64 h-screen sticky top-0 p-6 border-r border-gray-800">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-green-500">TRIBUNEROS</h1>
        <p className="text-sm text-gray-500 mt-1">La red social del fútbol</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-left h-12 px-4 ${
                  item.active
                    ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="h-6 w-6 mr-4" />
                <span className="text-lg">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Add Match Button */}
      <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-12 rounded-full mb-8">
        <Plus className="h-5 w-5 mr-2" />
        Agregar partido
      </Button>

      {/* User Profile */}
      <div className="mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-800 cursor-pointer transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback className="bg-green-600 text-black font-semibold">T</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">Tobias</p>
            <p className="text-sm text-gray-500 truncate">@tobiager</p>
          </div>
        </div>
      </div>
    </div>
  )
}
