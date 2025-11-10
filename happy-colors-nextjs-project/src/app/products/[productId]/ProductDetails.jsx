'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { isOwner } from '@/utils/isOwner';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation'; // декларативна навигация с Next
import styles from './details.module.css';

export default function ProductDetails({ product }) {
	const { user } = useAuth();
	const { addToCart } = useCart();
	const canEdit = isOwner(product, user);
	const router = useRouter();

	const handleAddToCart = () => {
		addToCart({
			_id: product._id,
			title: product.title,
			price: product.price,
			image: product.imageUrl,
		});

		// декларативно пренасочване
		router.push('/cart');
	};

	return (
		<section className={styles.productDetails}>
			<div className={styles.productDescriptionContainer}>
				<h2>{product.title}</h2>

				<div className={styles.reviewContainer}>
					<div className={styles.starsEmpty}>
						{[...Array(5)].map((_, i) => (
							<i key={i} className="fa-regular fa-star"></i>
						))}
					</div>

					<p className={styles.reviewCounter}>|</p>
					<p className={styles.reviewCounter}>{product.feedback?.length || 0} отзива</p>
					<p className={styles.reviewCounter}>|</p>
					<a className={styles.reviewLink} href="/">Оставете отзив</a>
				</div>

				<ul className={styles.productDetailsBodyTabsContainer}>
					<li className={styles.productDetailsBodyTab}><a href="/">описание</a></li>
					<li className={styles.productDetailsBodyTab}><a href="/">отзиви</a></li>
					<li className={styles.productDetailsBodyTab}><a href="/">доставка и плащане</a></li>
				</ul>

				<div className={styles.productDescriptionBody}>
					<p>{product.description}</p>
				</div>

				<p>Цена: {product.price} лв</p>

				{/* Бутоните */}
				<div className={styles.actionButtonsContainer}>
					<button onClick={handleAddToCart} className={styles.actionBtn}>
						Добави в количката
					</button>

					{canEdit && (
						<div className={styles.ownerActions}>
							<Link href={`/products/${product._id}/edit`} className={styles.actionBtn}>Редактирай</Link>
							<Link href={`/products/${product._id}/delete`} className={styles.actionBtn}>Изтрий</Link>
						</div>
					)}
				</div>
			</div>

			<div className={styles.productDetailsImagesContainer}>
				<div className={styles.productDetailsMainImage}>
					<img src={product.imageUrl} alt={product.title} />
				</div>

				<div className={styles.similarProductsContainer}>
					<h4 className={styles.similarProductsHeading}>Свързани продукти</h4>

					{(product.similarProducts || []).map((p, index) => (
						<div key={index} className={styles.connectedProductsContainer}>
							<Link href={`/products/${p._id}/details`} className={styles.connectedProductLink}>
								<img src={p.imageUrl} alt={p.title} />
								<h5>{p.title}</h5>
							</Link>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
