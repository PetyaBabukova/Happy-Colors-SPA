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
                    <li><a href="/">Начало</a></li>
                    <li className={styles.hasSubmenu}>
                        <Link href="/shop">Магазин</Link>
                        <ul className={styles.subNavList}>
                            <li><Link href="/toys">Животинки и играчки</Link></li>
                            <li><Link href="/dolls">Кукли с аксесоари</Link></li>
                            <li><Link href="/scarves-and-hats">Шалове и шапки</Link></li>
                            <li><Link href="bags">Чанти и раници</Link></li>
                        </ul>
                    </li>
                    <li><Link href="/aboutus">За мен</Link></li>
                    <li><Link href="/blog">Блог</Link></li>
                    <li><Link href="/partners">За партньори</Link></li>
                    <li><Link href="/contacts">Контакти</Link></li>
                    <li></li>
                </ul>

                <form action="" className={styles.searchForm} method="get">
                    <input type="text" placeholder="Търсене" className={styles.searchInput} />

                    <button type="submit" className={styles.searchBtn}><img src='/search_icon_green.svg'></img></button>
                </form>

                <Link href="/cart"><img className={styles.basketGreen} src='/basket_green.svg'></img></Link>
                {/* <Link href="/cart"><img className={styles.basketRed} src='/basket_orange.svg'></img></Link> */}
            </nav>
        </header>
    )
}
