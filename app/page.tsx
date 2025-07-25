"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, TrendingUp, Users, MessageCircle, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import AuthModal from "@/components/auth-modal"

export default function HomePage() {
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleGetStarted = () => {
    router.push("/partidos")
  }

  const handleViewMoments = () => {
    router.push("/moments")
  }

  const stats = [
    {
      value: "10K+",
      label: "Partidos registrados",
      color: "text-green-400",
    },
    {
      value: "2.5K+",
      label: "Usuarios activos",
      color: "text-blue-400",
    },
    {
      value: "50K+",
      label: "Comentarios",
      color: "text-purple-400",
    },
    {
      value: "8.7",
      label: "Rating promedio",
      color: "text-yellow-400",
    },
  ]

  const features = [
    {
      icon: <Star className="h-8 w-8 text-yellow-400" />,
      title: "Califica partidos",
      description: "Puntúa cada partido que veas y comparte tu experiencia con otros hinchas",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-blue-400" />,
      title: "Opina y comenta",
      description: "Comparte tus pensamientos sobre jugadas, decisiones arbitrales y momentos clave",
    },
    {
      icon: <Users className="h-8 w-8 text-green-400" />,
      title: "Conecta con hinchas",
      description: "Encuentra otros fanáticos que comparten tu pasión por el fútbol",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-400" />,
      title: "Descubre tendencias",
      description: "Ve qué partidos están siendo más comentados y mejor valorados",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-6">
              ⚽ La red social del fútbol
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              La red social donde los{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">hinchas</span>
              <br />
              puntúan partidos
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Registra cada partido que ves, puntúalo, comenta con otros hinchas y sigue el fútbol con pasión.
            </p>
            <p className="text-lg text-green-400 mb-12 font-medium">Tu experiencia futbolística, documentada.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-4 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Ver Partidos de Hoy
              </Button>
              <Button
                onClick={handleViewMoments}
                variant="outline"
                size="lg"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg bg-transparent"
              >
                Ver Momentos
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Todo lo que necesitas para seguir el fútbol</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Una plataforma completa para documentar tu experiencia futbolística
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800 hover:border-green-500/30 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">¿Listo para comenzar?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Únete a miles de hinchas que ya documentan su experiencia futbolística
          </p>
          <Button
            onClick={() => setShowAuthModal(true)}
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-4 text-lg"
          >
            Crear cuenta gratis
          </Button>
        </div>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  )
}
