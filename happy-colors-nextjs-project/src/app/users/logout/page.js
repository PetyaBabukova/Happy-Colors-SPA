'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logoutUser } from '@/managers/userManager';

export default function LogoutPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    logoutUser(setUser, router);
  }, [setUser, router]);

  return <p>Излизате...</p>;
}
