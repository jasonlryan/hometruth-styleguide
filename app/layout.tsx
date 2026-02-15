import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/contexts/user-context'

export const metadata: Metadata = {
  title: 'HomeTruth - Your Personal Property Assistant',
  description: 'Real answers for your property decisions. Property intelligence for buying, owning, and managing your home.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-gill-sans">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
