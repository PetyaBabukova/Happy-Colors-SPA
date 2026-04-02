// happy-colors-nextjs-project/src/app/contacts/page.js

import ContactForm from '../../components/contacts/ContactForm';
import styles from '../../components/products/create.module.css';

export const metadata = {
  title: 'Контакти',
  description:
    'Свържи се с Happy Colors за въпроси, поръчки и информация за ръчно изработените продукти.',
  alternates: {
    canonical: '/contacts',
  },
};

export default function ContactPage() {
  return (
    <section className={styles.createWrapper}>
      <h1 className={styles.title}>Контакти</h1>

      <p>+359 889 91 26 71, +359 887 45 45 09</p>

      <p>happy.colors.bg@gmail.com</p>

      <ContactForm />
    </section>
  );
}