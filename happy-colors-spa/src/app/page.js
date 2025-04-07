import Image from "next/image";

export default function Home() {
  return (
      <main>
        <header>
          
          <nav className="flex gap-[32px]">
            <div className="flex gap-[16px]">
              <img src="/logo_64pxH.svg" alt="Happy Colors Logo"/>
            </div>
            <div className="flex gap-[16px]">
              <a href="/">Начало</a>
              <a href="/shop#">Магазин</a>
              <a href="/blog">Блог</a>
              <a href="/aboutus">За мен</a>
              <a href="/partners">Партньори</a>
              <a href="/contactus">Контакти</a>
            </div>
            </nav>
        </header>
        <h1>Hello Happy Colors!</h1>
        
      </main>

  );
}
