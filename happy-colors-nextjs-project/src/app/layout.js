import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Happy Colors',
  description: 'Онлайн магазин за ръчно изработени изделия',
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
