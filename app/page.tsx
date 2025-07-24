"use client"

import { useState } from "react"
import { ArrowRight, Play, Users, Trophy, Star, Calendar, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import NavbarEnhanced from "@/components/navbar-enhanced"
import AuthModal from "@/components/auth-modal"
import { useAuth } from "@/lib/auth"
import Link from "next/link"

export default function LandingPage() {
  const { user } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const features = [
    {
      icon: Star,
      title: "Puntúa Partidos",
      description: "Califica cada partido que ves del 1 al 10 y comparte tu experiencia",
      color: "text-yellow-500",
    },
    {
      icon: MessageCircle,
      title: "Comenta y Debate",
      description: "Intercambia opiniones con otros hinchas sobre los partidos",
      color: "text-blue-500",
    },
    {
      icon: Play,
      title: "Guarda Momentos",
      description: "Sube videos y highlights de los mejores momentos del fútbol",
      color: "text-red-500",
    },
    {
      icon: Trophy,
      title: "Sigue Estadísticas",
      description: "Ve rankings, promedios y estadísticas de toda la comunidad",
      color: "text-green-500",
    },
  ]

  const stats = [
    { number: "10K+", label: "Partidos registrados" },
    { number: "2.5K+", label: "Usuarios activos" },
    { number: "50K+", label: "Comentarios" },
    { number: "8.7", label: "Rating promedio" },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavbarEnhanced />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-blue-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <Badge className="mb-6 bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
              🚀 La red social del fútbol
            </Badge>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              La red social donde los{" "}
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                hinchas
              </span>{" "}
              puntúan partidos
            </h1>

            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Registra cada partido que ves, puntúalo, comenta con otros hinchas y sigue el fútbol con pasión.
              <br />
              <span className="text-green-400 font-semibold">Tu experiencia futbolística, documentada.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {user ? (
                <Link href="/today">
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-lg">
                    Ver Partidos de Hoy
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-lg"
                >
                  Comenzá a registrar tus partidos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}

              <Link href="/moments">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg bg-transparent"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Ver Momentos
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-green-500 mb-2">{stat.number}</div>
                  <div className="text-gray-400 text-sm sm:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
              Todo lo que necesitás para seguir el <span className="text-green-500">fútbol</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Una plataforma completa diseñada por hinchas, para hinchas. Registra tu pasión futbolística.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-all duration-300 group"
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`inline-flex p-3 rounded-full bg-gray-800 mb-4 group-hover:scale-110 transition-transform ${feature.color}`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
              Así funciona <span className="text-green-500">TRIBUNEROS</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              En 3 simples pasos, empezá a documentar tu experiencia futbolística
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-green-500 text-black rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4">Registrate gratis</h3>
              <p className="text-gray-400 text-lg">
                Creá tu cuenta, elegí tus equipos favoritos y personalizá tu perfil de hincha.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-500 text-black rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4">Puntúa partidos</h3>
              <p className="text-gray-400 text-lg">
                Cada partido que veas, puntualo del 1 al 10. Agregá comentarios y guardá momentos especiales.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-500 text-black rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4">Conectá con hinchas</h3>
              <p className="text-gray-400 text-lg">
                Compartí opiniones, debatí con otros usuarios y seguí las estadísticas de la comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">¿Listo para empezar tu historia futbolística?</h2>
          <p className="text-xl text-gray-300 mb-12">
            Únete a miles de hinchas que ya están registrando su pasión por el fútbol
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/today">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-lg">
                  <Calendar className="mr-2 h-5 w-5" />
                  Ver Partidos de Hoy
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 text-lg"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Crear cuenta gratis
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setAuthModalOpen(true)}
                  className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg"
                >
                  Ya tengo cuenta
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  )
}
