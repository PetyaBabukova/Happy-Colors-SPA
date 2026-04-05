// happy-colors-nextjs-project/src/app/users/logout/page.js

import LogoutClient from './LogoutClient';

export const metadata = {
  title: 'Изход',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LogoutPage() {
  return <LogoutClient />;
}
