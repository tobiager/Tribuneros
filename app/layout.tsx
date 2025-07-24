import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tribuneros - La red social del fútbol",
  description: "Registra, puntúa y comparte los partidos que ves. La red social para los verdaderos hinchas.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>{children}</body>
    </html>
  )
}
