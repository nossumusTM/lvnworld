import type { Metadata } from "next";
import './globals.css'

import { headers } from 'next/headers';
import ContextProvider from "../../context";

export const metadata: Metadata = {
  title: 'Krashbox│▌▌│▌▌ ▌ │▌ ▌ ▌│▌',
  description: 'Powered by Nossumus Foundation.'
};

// Define RootLayout
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {

  // Check if we're in a server-side context before calling headers
  let cookies: string | null = null;
  if (typeof headers === 'function') {
    const serverHeaders = headers();
    cookies = serverHeaders?.get('cookie') || null;
  }

  return (
    <html lang="en">
    <head>
    {/* Favicon using PNG */}
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
    </head>
      <body>
        {/* Wrap everything in the ContextProvider and pass cookies */}
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  );
}