import React from 'react'
import styles from './shop.module.css'
import Link from 'next/link';
import Image from 'next/image';


export default function Shop() {
	return (
		<section className={styles.shopPage}>
			<h1 className={styles.shopPageTitle}>Магазин</h1>



			<section className={styles.categories}>
				<article className={styles.shoppingCategory}>
					<h3>Животинки и играчки</h3>
					<div className={styles.productList}>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>
					</div>

				</article>

				<article className={styles.shoppingCategory}>
					<h3>Кукли с аксесоари</h3>
					<div className={styles.productList}>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>
					</div>

				</article>

				<article className={styles.shoppingCategory}>
					<h3>Шалове и шапки</h3>
					<div className={styles.productList}>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>
					</div>

				</article>

				<article className={styles.shoppingCategory}>
					<h3>Чанти и раници</h3>
					<div className={styles.productList}>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>

						<Link href="products/details" className={styles.product}>
							<img src="/toy_sample.jpg" alt="product" />
							<h4>Хипопотам Хипо</h4>
							<p>Цена: 100лв</p>
						</Link>
					</div>

				</article>
			</section>
		</section>
	)
}
