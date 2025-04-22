import Image from "next/image";
import styles from "./homePage.module.css";

export default function Home() {
	return (
		<>
			<main>

				<section className={styles.heroSection}>
					<div className={styles.heroImageContainer}>
						<img src="images/woman-wrappes-presents-craft-paper-gifts-tied-with-white-red-threads-with-toy-train-as-decor.jpg"
							alt="" srcset="" />
					</div>

					<div className={styles.rightHeroSection}>
						<div className={styles.heroText}>
							<h1>Добре дошли в Happy Colors,</h1>
							<h2>Тук всяко творение носи частица щастие</h2>
							<p>
								В този малък онлайн свят ще откриете ръчно изработени плетени играчки, аксесоари и още цветни
								вдъхновения, създадени с внимание, вдъхновение и много любов. Всяко нещо тук е изработено в единствен екземпляр и ако сте си харесали нещо, което вече е намерило своя дом с радост ще го изработя отново специално за вас.
							</p>
							<p>
								Мечтая Happy Colors да се превърне в място за всички, които ценят ръчната изработка – както
								творци, така и ценители. С времето ще ви срещам и с други артисти и техните уникални хендмейд творения.
								Благодаря ви, че сте тук 💛

							</p>
						</div>
						<div className={styles.hiroLinks}>
							<a href="products.html" className={styles.heroLink}>
								<div className={styles.heroLinkImageContainer}>
									<img src="/images/toy_sample.jpg" alt="" />
								</div>
								<h6>Кукли с аксесоари</h6>
							</a>

							<a href="products.html" className={styles.heroLink}>
								<div className={styles.heroLinkImageContainer}>
									<img src="/images/toy_sample.jpg" alt="" />
								</div>
								<h6>Плетени играчки</h6>
							</a>

							<a href="products.html" className={styles.heroLink}>
								<div className={styles.heroLinkImageContainer}>
									<img src="/images/toy_sample.jpg" alt="" />
								</div>
								<h6>Чанти и раници</h6>
							</a>

							<a href="products.html" className={styles.heroLink}>
								<div className={styles.heroLinkImageContainer}>
									<img src="/images/toy_sample.jpg" alt="" />
								</div>
								<h6>Шалове и шапки</h6>
							</a>

						</div>
					</div>
				</section>

			</main>
		</>

	);
}

