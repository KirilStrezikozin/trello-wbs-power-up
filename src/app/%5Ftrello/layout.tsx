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