import { Roboto } from "next/font/google";
import "./globals.css";
import { ShoppingCart } from "lucide-react"; // иконка за количка

const roboto = Roboto({
	subsets: ['latin', 'cyrillic'],
	weight: ['100', '200', '300', '400', '500', '700'],
	variable: '--font-roboto',
});

export const metadata = {
	title: "Happy Colors",
	description: "Онлайн магазин за ръчно изработени изделия",
};

export default function RootLayout({ children }) {
	return (
		<html lang="bg" >
			<body className={`${roboto.variable} antialiased`}>
				<header className="bg-[#FFF1CD] text-[#003427]">
					{/* <header className="bg-[#fff] text-[#003427]"> */}
					<nav>
						<div className="container mx-auto px-4 flex items-center justify-between py-4 font-sans">
							{/* Лого отляво */}
							<div className="flex items-center gap-4">
								<img src="/logo_48pxH.svg" alt="Happy Colors Logo" className="h-12" />
							</div>

							{/* Основна навигация в средата */}
							<div className="flex gap-[40px] font-medium text-base">
								<a href="/" className="nav-link">Начало</a>
								<a href="/shop" className="nav-link">Магазин
									{/* <a>Плетени играчки</a>
									<a>Плетени кукли</a>
									<a>Чанти | Раници</a>
									<a>Шапки | Шалове</a> */}
								</a>
								<a href="/aboutus" className="nav-link">За нас</a>
								<a href="/blog" className="nav-link">Блог</a>
								<a href="/partners" className="nav-link">За партньори</a>
								<a href="/contacts" className="nav-link">Контакти</a>
							</div>

							{/* Допълнителни бутони вдясно */}
							<div className="flex items-center gap-4">
								{/* <a
									href="/ask"
									className="px-4 py-2 border border-[#003427] rounded hover:bg-[#003427] hover:text-[var(--happy-yellow)] transition text-sm"
								>
									Задайте въпрос
								</a> */}

								<a href="/cart" className="text-[#4BD0AE] hover:text-[#1A6B41] transition" title="Количка">
									<ShoppingCart size={24} />
								</a>
							</div>
						</div>
					</nav>
				</header>

				<main className="container mx-auto px-8">
					<>
						{children}
					</>
				</main>

				<footer className="bg-[#FFF1CD] text-[#003427] py-4">
					<p className="container my-0 mx-auto  px-4 flex items-center justify-between font-sans">All rigts reserved 2025</p>
				</footer>
			</body>
		</html>
	);
}
