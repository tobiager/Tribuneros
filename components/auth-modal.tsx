"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signIn, signUp, signInWithOAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    username: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await signIn(loginData.email, loginData.password)

    if (error) {
      setError(error.message)
    } else {
      onOpenChange(false)
      setLoginData({ email: "", password: "" })
    }

    setLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await signUp(signupData.email, signupData.password, signupData.username)

    if (error) {
      setError(error.message)
    } else {
      onOpenChange(false)
      setSignupData({ email: "", password: "", username: "" })
    }

    setLoading(false)
  }

  const handleOAuthSignIn = async (provider: "google" | "twitter") => {
    setOauthLoading(provider)
    setError("")

    try {
      const { error } = await signInWithOAuth(provider)

      if (error) {
        setError(error.message)
      } else {
        onOpenChange(false)
      }
    } catch (err) {
      setError("Error al conectar con " + provider)
    } finally {
      setOauthLoading(null)
    }
  }

  const resetForm = () => {
    setLoginData({ email: "", password: "" })
    setSignupData({ email: "", password: "", username: "" })
    setError("")
    setShowPassword(false)
    setShowSignupPassword(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-gray-950 border-gray-800 text-white">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-2xl font-bold text-green-500 mb-2">Bienvenido a TRIBUNEROS</DialogTitle>
          <p className="text-gray-400 text-sm">
            La red social donde los hinchas puntúan partidos y siguen el fútbol con pasión
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleOAuthSignIn("google")}
              disabled={oauthLoading !== null}
              className="w-full h-12 bg-white hover:bg-gray-100 text-gray-900 font-semibold border border-gray-300 transition-all duration-200 hover:shadow-lg"
            >
              {oauthLoading === "google" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-3" />
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continuar con Google
            </Button>

            <Button
              onClick={() => handleOAuthSignIn("twitter")}
              disabled={oauthLoading !== null}
              className="w-full h-12 bg-black hover:bg-gray-900 text-white font-semibold border border-gray-700 transition-all duration-200 hover:shadow-lg"
            >
              {oauthLoading === "twitter" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
              ) : (
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              )}
              Continuar con X (Twitter)
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-950 px-4 text-gray-400 font-medium">O continúa con email</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Email/Password Forms */}
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 h-11">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold"
              >
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold"
              >
                Registrarse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300 font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tu contraseña"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-10 pr-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button type="button" className="text-sm text-green-500 hover:text-green-400 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading || oauthLoading !== null}
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-11 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                      Iniciando...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-gray-300 font-medium">
                    Nombre de usuario
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="tu_usuario"
                      value={signupData.username}
                      onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                      className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-300 font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-300 font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="pl-10 pr-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-green-500/20 h-11"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Debe tener al menos 6 caracteres</p>
                </div>

                <div className="text-xs text-gray-400 leading-relaxed">
                  Al registrarte, aceptas nuestros{" "}
                  <button className="text-green-500 hover:text-green-400 underline">Términos de Servicio</button> y{" "}
                  <button className="text-green-500 hover:text-green-400 underline">Política de Privacidad</button>
                </div>

                <Button
                  type="submit"
                  disabled={loading || oauthLoading !== null}
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-11 transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-800">
            <p>¿Problemas para acceder?</p>
            <button className="text-green-500 hover:text-green-400 underline mt-1">Contacta con soporte</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
