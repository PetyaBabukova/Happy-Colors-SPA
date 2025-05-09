import "./globals.css";
import Header from "../header/header";

export const metadata = {
  title: "Happy Colors",
  description: "Онлайн магазин за ръчно изработени изделия",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>
        <Header />
        <main>{children}</main>
        <footer>
          <p>All rights reserved 2025</p>
        </footer>
      </body>
    </html>
  );
}
