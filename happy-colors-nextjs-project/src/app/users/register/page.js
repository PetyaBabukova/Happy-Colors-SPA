import RegisterForm from './RegisterForm';

export const metadata = {
  title: 'Регистрация',
  description:
    'Създай профил в Happy Colors и се включи в нашата цветна общност.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}