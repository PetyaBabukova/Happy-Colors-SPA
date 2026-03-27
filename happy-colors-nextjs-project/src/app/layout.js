// src/app/layout.js

import './globals.css';
import ClientLayout from './ClientLayout';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://happycolors.eu';

const isProductionSite =
  process.env.NEXT_PUBLIC_SITE_ENV === 'production';

export const metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'Happy Colors',
    template: '%s | Happy Colors',
  },

  description: 'Онлайн магазин за ръчно изработени изделия',

  robots: {
    index: isProductionSite,
    follow: isProductionSite,
  },

  alternates: {
    canonical: '/',
  },

  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}