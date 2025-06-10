import './globals.css';
import AuthWrapper from '@/context/AuthWrapper';
import { ProductProvider } from '@/context/ProductContext';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Happy Colors',
  description: 'Онлайн магазин за ръчно изработени изделия',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body suppressHydrationWarning>
        <AuthWrapper>
          <ProductProvider>
            <ClientLayout>{children}</ClientLayout>
          </ProductProvider>
        </AuthWrapper>
      </body>
    </html>
  );
}
