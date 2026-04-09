import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import "./globals.css";
import { ThemeProvider } from "next-themes";
import QueryClientProviderWrapper from "@/components/QueryClientProviderWrapper";
import { cookies } from "next/headers";
import { AuthProvider } from "@/contexts/authContext";
import { LocationProvider } from "@/contexts/locationContext";
import { NotificationProvider } from "@/contexts/notificationContext";
import { Toaster } from "sonner";
import GoogleAuthProvider from "@/components/GoogleAuthProvider";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Using Plus Jakarta Sans as an alternative to Satoshi/General Sans for Headings
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

export const metadata: Metadata = {
  title: "DiDoo",
  description: "DiDoo website",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");
  const refreshToken = cookieStore.get("refreshToken");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakarta.variable} bg-background antialiased`}
      >
        <GoogleAuthProvider>
          <AuthProvider initialAccessToken={accessToken?.value || null} initialRefreshToken={refreshToken?.value || null}>
            <LocationProvider>
              <QueryClientProviderWrapper>
                <NotificationProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}
                  <Toaster richColors position="top-center" />
                </ThemeProvider>
                </NotificationProvider>
              </QueryClientProviderWrapper>
            </LocationProvider>
          </AuthProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
