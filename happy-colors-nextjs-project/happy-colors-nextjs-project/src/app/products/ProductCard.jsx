'use client';

import Link from 'next/link';
import styles from './shop.module.css';

export default function ProductCard({ product }) {
    return (
        <Link href={`/products/${product._id}`} className={styles.product}>
            <div className={styles.productImageContainer}>
                <img src={product.imageUrl} alt={product.title} />
            </div>
            <h4>{product.title}</h4>
            <p>Цена: {product.price} €</p>
        </Link>
    );
}
