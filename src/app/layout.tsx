import './globals.css'
import { Inter } from 'next/font/google'
import Layout from '@/components/Navbar'
// import { ThemeProvider } from '@/contexts/theme-context'

import { Toaster } from "@/components/ui/toaster" 
import {Providers} from "./providers";
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Barta বার্তা',
  description: 'Find lawyers, book appointments, get real-time legal help from us. Professional legal services made simple and accessible. Get expert legal advice and representation from Barta, your trusted legal partner.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* <ThemeProvider> */}
        <Providers>
          <Layout>{children}
          </Layout><Toaster />
        </Providers>
        {/* </ThemeProvider> */}
      </body>
    </html>
  )
}

