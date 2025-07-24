import { Search, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function DesktopNavbar() {
  return (
    <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="text-2xl font-bold text-green-500">TRIBUNEROS</div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar partidos, equipos, usuarios..."
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-green-500"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link href="/explore" className="text-gray-300 hover:text-green-500 font-medium">
              Explorar
            </Link>
            <Link href="/add-match" className="text-gray-300 hover:text-green-500 font-medium">
              <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-500">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback className="bg-green-600">T</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </nav>
  )
}
