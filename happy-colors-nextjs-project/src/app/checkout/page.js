import CheckoutClientPage from './CheckoutClientPage';

export const metadata = {
  title: 'Завършване на поръчката',
  description: 'Страница за завършване на поръчка в Happy Colors.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClientPage />;
}