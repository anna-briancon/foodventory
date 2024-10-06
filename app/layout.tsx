import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Foodventory - Gérez votre inventaire alimentaire',
  description: 'Foodventory vous aide à gérer votre inventaire alimentaire et vos recettes facilement.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}