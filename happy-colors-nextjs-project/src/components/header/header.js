'use client';
import React, { useState } from 'react';
import styles from './header.module.css';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const { visibleCategories } = useProducts();

  // Показваме loader или нищо само докато върви заявката за user
  if (loading) return null;

  return (
    <>
      <header className="header">
        <nav className={styles.mainNav}>
          <Link href="/">
            <div className={styles.logoContainer}>
              <Image src="/logo_64pxH.svg" alt="logo" width={256} height={256} />
            </div>
          </Link>

          {!mobileMenuOpen && (
            <button
              className={styles.hamburgerBtn}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Image src="/hamburger.svg" alt="Меню" width={64} height={64} />
            </button>
          )}

          <ul className={`${styles.mainNavList} ${mobileMenuOpen ? styles.showMenu : ''}`}>
            <li><Link href="/" onClick={() => setMobileMenuOpen(false)}>Начало</Link></li>

            <li className={styles.hasSubmenu}>
              <Link className={styles.menuItem} href="/products" onClick={() => setMobileMenuOpen(false)}>Магазин</Link>
              {visibleCategories && visibleCategories.length > 0 && (
                <ul className={styles.subNavList}>
                  <li>
                    <Link href="/products" onClick={() => setMobileMenuOpen(false)}>Всички</Link>
                  </li>
                  {visibleCategories.map(cat => (
                    <li key={cat._id}>
                      <Link
                        href={`/products?category=${encodeURIComponent(cat.name)}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li><Link href="/aboutus" onClick={() => setMobileMenuOpen(false)}>За мен</Link></li>
            <li><Link href="/blog" onClick={() => setMobileMenuOpen(false)}>Блог</Link></li>
            <li><Link href="/partners" onClick={() => setMobileMenuOpen(false)}>За партньори</Link></li>
            <li><Link href="/contacts" onClick={() => setMobileMenuOpen(false)}>Контакти</Link></li>
          </ul>

          <form className={styles.searchForm} action="/search" method="get">
            <input type="text" name="q" placeholder="Търсене" className={styles.searchInput} />
            <button type="submit" className={styles.searchBtn}>
              <Image src="/search_icon_green.svg" alt="search icon" width={16} height={16} />
            </button>
          </form>

          {user?.username ? (
            <p className={styles.userGreeting}>
              Здравей, {user.username} | <Link href="/users/logout">Изход</Link>
            </p>
          ) : (
            <p className={styles.userGreeting}>
              <Link href="/users/register">Регистрация</Link> | <Link href="/users/login">Вход</Link>
            </p>
          )}

          <Link href="/cart">
            <Image className={styles.basketGreen} src="/basket_green.svg" alt="Количка" width={32} height={32} />
          </Link>
        </nav>
      </header>

      {user && (
        <ul className={styles.userNav}>
          <li><Link href="/products/create">Създай продукт</Link></li>
          <li><Link href="/categories/create">Създай категория</Link></li>
          <li><Link href="/categories">Категории</Link></li>
        </ul>
      )}
    </>
  );
}
