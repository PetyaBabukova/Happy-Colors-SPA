'use client';
import React, { useState } from 'react';
import styles from './header.module.css';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className='header'>
      <nav className={styles.mainNav}>
        <Link href="/">
          <div className={styles.logoContainer}>
            <img src="/logo_64pxH.svg" alt="logo" />
          </div>
        </Link>

        <button
          className={styles.hamburgerBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <img src="/hamburger.svg" alt="Меню" />
        </button>

        <ul className={`${styles.mainNavList} ${mobileMenuOpen ? styles.showMenu : ''}`}>
          <li><Link href="/">Начало</Link></li>
          <li className={styles.hasSubmenu}>
            <Link className={styles.menuItem} href="/products">Магазин</Link>
            <ul className={styles.subNavList}>
              <li><Link href="/products/all">Всички</Link></li>
              <li><Link href="/products/toys">Животинки и играчки</Link></li>
              <li><Link href="/products/dolls">Кукли с аксесоари</Link></li>
              <li><Link href="/products/scarves-and-hats">Шалове и шапки</Link></li>
              <li><Link href="/products/bags">Чанти и раници</Link></li>
            </ul>
          </li>
          <li><Link href="/aboutus">За мен</Link></li>
          <li><Link href="/blog">Блог</Link></li>
          <li><Link href="/partners">За партньори</Link></li>
          <li><Link href="/contacts">Контакти</Link></li>
        </ul>

        <form className={styles.searchForm} method="get">
          <input type="text" placeholder="Търсене" className={styles.searchInput} />
          <button type="submit" className={styles.searchBtn}>
            <img src='/search_icon_green.svg' alt="search icon" />
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
          <img className={styles.basketGreen} src='/basket_green.svg' alt="Количка" />
        </Link>
      </nav>
    </header>
  );
}
