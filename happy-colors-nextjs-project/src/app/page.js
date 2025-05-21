'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
	return (
		<>

			<section className={styles.heroSection}>
				<div className={styles.leftHiroSection}>

					<div className={styles.hiroAccent}>
						<div className={styles.heroSmallImageContainer}>
							<Image src="/toy_sample.jpg" alt="" width={300} height={300} />
						</div>
						<h2>Lorem ipsum dolor!</h2>
					</div>

					<div className={styles.hiroAccent}>
						<div className={styles.heroSmallImageContainer}>
							<Image src="/toy_sample.jpg" alt="" width={300} height={300} />
						</div>
						<h2>Lorem ipsum dolor!</h2>
					</div>

					<div className={styles.hiroAccent}>
						<div className={styles.heroSmallImageContainer}>
							<Image src="/toy_sample.jpg" alt="" width={300} height={300} />
						</div>
						<h2>Lorem ipsum dolor!</h2>
					</div>

				</div>

				<div className={styles.rightHiroSection}>
					<h1>Hello from Happy Colors</h1>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis, voluptas.
						Autem, eaque in illum accusantium, veniam ea corporis, quibusdam placeat
						consectetur optio hic libero quia qui eveniet nisi. Minima nesciunt laudantium
						ipsa placeat molestiae quibusdam voluptates ab explicabo alias tempora maxime
						iusto veniam, dolores eligendi, nobis cum aspernatur cupiditate blanditiis.
					</p>
					<Link href="/products" className={styles.hiroShopLink}>Магазин</Link>
				</div>

				<div className={styles.breadcrumb}>
					<p>Breadcrumb | Breadcrumb | Breadcrumb</p>
				</div>
			</section>

			<section className={styles.shoppingCategories}>

				<article className={styles.shoppingCategory}>
					<Link href="/products/toys">
						<div className={styles.shoppingCategoryImageContainer}>
							<Image src="/toy_sample.jpg" alt="" width={300} height={300} />
						</div>
						<div className={styles.categoryDescription}>
							<h3>Животинки и играчки</h3>
							<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus. Lorem ipsum
								dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.</p>
						</div>
					</Link>
				</article>

				<article className={styles.shoppingCategory}>
					<Link href="/products/dolls">
						<div className={styles.shoppingCategoryImageContainer}>
							<Image src="/toy_sample.jpg" alt="" width={300} height={300} />
						</div>
						<div className={styles.categoryDescription}>
							<h3>Кукли с аксесоари</h3>
							<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus. Lorem ipsum
								dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.</p>
						</div>
					</Link>
				</article>

				<article className={styles.shoppingCategory}>
					<Link href="/products/scarves-and-hats">
						<div className={styles.shoppingCategoryImageContainer}>
							<Image src="/toy_sample.jpg" alt="" width={300} height={300} />
						</div>
						<div className={styles.categoryDescription}>
							<h3>Шалове и шапки</h3>
							<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus. Lorem ipsum
								dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.</p>
						</div>
					</Link>
				</article>

				<article className={styles.shoppingCategory}>
					<Link href="/products/bags">
						<div className={styles.shoppingCategoryImageContainer}>
							<Image src="/toy_sample.jpg" alt="category-image" width={300} height={300} />
						</div>
						<div className={styles.categoryDescription}>
							<h3>Шалове и шапки</h3>
							<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus. Lorem ipsum
								dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.</p>
						</div>
					</Link>
				</article>

			</section>
		</>
	);
}
