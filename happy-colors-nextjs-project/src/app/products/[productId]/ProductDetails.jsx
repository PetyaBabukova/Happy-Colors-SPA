// happy-colors-nextjs-project/src/app/products/[productId]/ProductDetails.jsx

'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { isOwner } from '@/utils/isOwner';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import styles from './details.module.css';

export default function ProductDetails({ product }) {
	const { user } = useAuth();
	const { addToCart } = useCart();
	const canEdit = isOwner(product, user);
	const router = useRouter();

	const isAvailable = product?.availability !== 'unavailable';

	const availabilityLabel = isAvailable
		? 'Продукта е наличен и можете да го поръчате'
		: 'Продукта не е наличен, ако желаете пратете запитване';

	const handleAddToCart = () => {
		addToCart({
			_id: product._id,
			title: product.title,
			price: product.price,
			image: product.imageUrl,
		});

		router.push('/cart');
	};

	const handleInquiry = () => {
		router.push(`/contacts?productId=${product._id}`);
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
				</div>

				<ul className={styles.productDetailsBodyTabsContainer}>
					<li className={styles.productDetailsBodyTab}><a href="/">описание</a></li>
					<li className={styles.productDetailsBodyTab}><a href="/">доставка и плащане</a></li>
				</ul>

				<div className={styles.productDescriptionBody}>
					<p>{product.description}</p>
				</div>

				{/* Наличност */}
				<p className={isAvailable ? styles.available : styles.unavailable}>
					<b>Наличност:</b> {availabilityLabel}
				</p>

				<p><b>Цена:</b> {product.price} лв</p>

				{/* Действия */}
				<div className={styles.actionButtonsContainer}>
					{isAvailable ? (
						<button onClick={handleAddToCart} className={styles.actionBtn}>
							Добави в количката
						</button>
					) : (
						<button
							onClick={handleInquiry}
							className={styles.actionBtn}
						>
							Попитай
						</button>
					)}

					{canEdit && (
						<div className={styles.ownerActions}>
							<Link href={`/products/${product._id}/edit`} className={styles.actionBtn}>
								Редактирай
							</Link>
							<Link href={`/products/${product._id}/delete`} className={styles.actionBtn}>
								Изтрий
							</Link>
						</div>
					)}
				</div>
			</div>

			<div className={styles.productDetailsImagesContainer}>
				<div className={styles.productDetailsMainImage}>
					<img src={product.imageUrl} alt={product.title} />
				</div>
			</div>
		</section>
	);
}
