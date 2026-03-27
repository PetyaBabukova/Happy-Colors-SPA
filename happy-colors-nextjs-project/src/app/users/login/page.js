import LoginClientPage from './LoginClientPage';

export const metadata = {
  title: 'Вход',
  description: 'Вход в профила в Happy Colors.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginClientPage />;
}