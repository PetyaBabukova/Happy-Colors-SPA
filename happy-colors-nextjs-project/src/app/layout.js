// src/app/layout.js
import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Happy Colors',
  description: 'Онлайн магазин за ръчно изработени изделия',
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
