import type { Metadata } from "next";
import './globals.css'
import ConsoleNoiseFilter from './ConsoleNoiseFilter'

const earlyConsoleNoiseFilter = `
(() => {
  const noisyPatterns = [
    'SES Removing unpermitted intrinsics',
    'Removing intrinsics.%MapPrototype%.getOrInsert',
    'Removing intrinsics.%MapPrototype%.getOrInsertComputed',
    'Removing intrinsics.%WeakMapPrototype%.getOrInsert',
    'Removing intrinsics.%WeakMapPrototype%.getOrInsertComputed',
    'Removing intrinsics.%DatePrototype%.toTemporalInstant',
    'lockdown-install.js'
  ];

  const shouldSuppress = (args) => {
    const message = args.map((value) => {
      if (typeof value === 'string') return value;
      try { return JSON.stringify(value); }
      catch (_error) { return String(value); }
    }).join(' ');

    return noisyPatterns.some((pattern) => message.includes(pattern));
  };

  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  const originalInfo = console.info;

  console.warn = (...args) => {
    if (shouldSuppress(args)) return;
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (shouldSuppress(args)) return;
    originalError(...args);
  };

  console.log = (...args) => {
    if (shouldSuppress(args)) return;
    originalLog(...args);
  };

  console.info = (...args) => {
    if (shouldSuppress(args)) return;
    originalInfo(...args);
  };
})();
`;

export const metadata: Metadata = {
  title: 'Inaplanet Foundation.',
  description: 'Defining the future, bit by bit.'
};

// Define RootLayout
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {

  // Check if we're in a server-side context before calling headers
  // let cookies: string | null = null;
  // if (typeof headers === 'function') {
  //   const serverHeaders = headers();
  //   cookies = serverHeaders?.get('cookie') || null;
  // }

  return (
    <html lang="en">
    <head>
    {/* Favicon using PNG */}
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
    <link rel="icon" href="/favicon.ico" sizes="256x256" />
    <script dangerouslySetInnerHTML={{ __html: earlyConsoleNoiseFilter }} />
    </head>
      <body>
        <ConsoleNoiseFilter />
        {children}
      </body>
    </html>
  );
}
