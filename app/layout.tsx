import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HomeTruth - Your Personal Property Assistant',
  description: 'AI-powered property guidance for buying, selling, and managing property with confidence',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-gill-sans">{children}</body>
    </html>
  )
}
