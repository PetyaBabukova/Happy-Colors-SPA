import "./globals.css";
import { AuthProvider } from '../context/authContext';

import Header from "../components/header/header";

export const metadata = {
  title: "Happy Colors",
  description: "Онлайн магазин за ръчно изработени изделия",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <footer>
            <p>All rights reserved 2025</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
