// src/app/layout.js

import './globals.css';
import styles from './page.module.css';
import ClientLayout from './ClientLayout';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://happycolors.eu';

const isProductionSite =
  process.env.NEXT_PUBLIC_SITE_ENV === 'production';

export const metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'Плетени играчки, аксесоари и декорация за дома | Happy Colors',
    template: '%s | Happy Colors',
  },

  description: 'Ръчно изработени плетени играчки, аксесоари и декорация за дома от Happy Colors – оригинални идеи за подарък, уют и красиви изделия с характер.',

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
              <footer className={styles.footer}>
				<p>© 2026 Happy Colors. Всички права запазени.</p>
			</footer>
      </body>

    </html>
  );
}