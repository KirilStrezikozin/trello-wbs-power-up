/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

import '../globals.css';
import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://p.trellocdn.com/power-up.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}