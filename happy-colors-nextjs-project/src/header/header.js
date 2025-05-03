import React from 'react'
import styles from './header.module.css'
import Link from 'next/link';

export default function Header() {
    return (
        <header>
            <nav className={styles.mainNav}>
                <Link href="/">
                    <div className={styles.logoContainer}>
                        <img src="/logo_64pxH.svg" alt="logo" />
                    </div>
                </Link>

                <ul className={styles.mainNavList}>
                    <li><Link href="/">Начало</Link></li>

                    <li className={styles.hasSubmenu}>
                        <Link className={styles.menuItem} href="#">Магазин</Link>
                        <ul className={styles.subNavList}>
                            <li><Link href="/toys">Животинки</Link></li>
                            <li><Link href="/dolls">Кукли</Link></li>
                            <li><Link href="/scarves-and-hats">Шалове</Link></li>
                            <li><Link href="/bags">Чанти</Link></li>
                        </ul>
                    </li>


                    <li><Link href="/aboutus">За мен</Link></li>
                    <li><Link href="/blog">Блог</Link></li>
                    <li><Link href="/partners">За партньори</Link></li>
                    <li><Link href="/contacts">Контакти</Link></li>
                </ul>



                <form action="" className={styles.searchForm} method="get">
                    <input type="text" placeholder="Търсене" className={styles.searchInput} />
                    <button type="submit" className={styles.searchBtn}>
                        <img src='/search_icon_green.svg' alt="Търсене" />
                    </button>
                </form>

                <Link href="/cart">
                    <img className={styles.basketGreen} src='/basket_green.svg' alt="Количка" />
                </Link>
            </nav>
        </header>
    )
}
