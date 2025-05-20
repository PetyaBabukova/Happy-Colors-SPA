// ✅ /src/app/layout.js
import './globals.css';
import Header from '@/components/header/header';
import AuthWrapper from '@/context/AuthWrapper';

export const metadata = {
  title: 'Happy Colors',
  description: 'Онлайн магазин за ръчно изработени изделия',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>
        <AuthWrapper>
          <Header />
          <main>{children}</main>
        </AuthWrapper>
      </body>
    </html>
  );
}