'use client';

import styles from './details.module.css';

export default function ProductDetails({ product }) {
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
          <li className={styles.productDetailsBodyTab}><a href="/" target="_blank" rel="noopener noreferrer">описание</a></li>
          <li className={styles.productDetailsBodyTab}><a href="/" target="_blank" rel="noopener noreferrer">отзиви</a></li>
          <li className={styles.productDetailsBodyTab}><a href="/" target="_blank" rel="noopener noreferrer">доставка и плащане</a></li>
        </ul>

        <div className={styles.productDescriptionBody}>
          <p>{product.description}</p>
        </div>

        <p>Цена: {product.price} лв</p>
        <a className={styles.putInCartLink} href="/cart">Сложи в количката</a>
      </div>

      <div className={styles.productDetailsImagesContainer}>
        <div className={styles.productDetailsMainImage}>
          <img src={product.imageUrl} alt={product.title} />
        </div>

        <div className={styles.similarProductsContainer}>
          <h4 className={styles.similarProductsHeading}>Свързани продукти</h4>

          {(product.similarProducts || []).map((p, index) => (
            <div key={index} className={styles.connectedProductsContainer}>
              <a href={`/products/${p._id}/details`} className={styles.connectedProductLink}>
                <img src={p.imageUrl} alt={p.title} />
                <h5>{p.title}</h5>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
