
// happy-colors-nextjs-project/src/app/contacts/page.js
import ContactForm from '../../components/contacts/ContactForm';
import styles from '../../components/products/create.module.css';

export const metadata = {
  title: 'Контактна форма | Happy Colors',
};

export default function ContactPage() {
  return (
    <section className={styles.createWrapper}>
      <h1 className={styles.title}>Контакти</h1>
      <h5 className={styles.title}> +359 889 91 26 71, +359 887 45 45 09</h5>
      <h5 className={styles.title}> happy.colors.bg@gmail.com</h5>
      <ContactForm />
    </section>
  );
}
