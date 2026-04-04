// happy-colors-nextjs-project/src/app/contacts/page.js

import ContactForm from '../../components/contacts/ContactForm';
import styles from '../../components/products/create.module.css';
import baseURL from '@/config';

export const metadata = {
  title: 'Контакти',
  description:
    'Свържи се с Happy Colors за въпроси, поръчки и информация за ръчно изработените продукти.',
  alternates: {
    canonical: '/contacts',
  },
};

async function fetchProduct(productId) {
  if (!productId) return null;

  try {
    const res = await fetch(`${baseURL}/products/${productId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ContactPage({ searchParams }) {
  const params = await searchParams;
  const product = await fetchProduct(params?.productId);

  return (
    <section className={styles.createWrapper}>
      <h1 className={styles.title}>Контакти</h1>

      <p>+359 889 91 26 71, +359 887 45 45 09</p>

      <p>happy.colors.bg@gmail.com</p>

      <ContactForm product={product} />
    </section>
  );
}