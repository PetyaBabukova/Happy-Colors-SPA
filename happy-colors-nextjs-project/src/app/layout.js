import "./globals.css"; // ако си в src/app/
import Header from "../header/header"; // ако си в src/app/
import Head from "./head";



export const metadata = {
	title: "Happy Colors",
	description: "Онлайн магазин за ръчно изработени изделия",
};

export default function RootLayout({ children }) {
	return (
		<html lang="bg">
			<head>
				<link
					rel="stylesheet"
					href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
					integrity="sha512-dP1UjV+7inUCMXENa9kBQJEOXOg5K0YtvOc9b+0YtrgYIYFfGC+cKO0yHaJ6KcfRe4NKv3ecM3cw/fp2aHcU1g=="
					crossOrigin="anonymous"
					referrerPolicy="no-referrer"
				/>
			</head>


			<body>
				<Header />
				<main >{children}</main>
				<footer>
					<p>All rights reserved 2025</p>
				</footer>
			</body>
		</html>
	);
}
