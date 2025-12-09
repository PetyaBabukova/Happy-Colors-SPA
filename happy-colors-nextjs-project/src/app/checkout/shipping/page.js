// happy-colors-nextjs-project/src/app/checkout/shipping/page.js

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import baseURL from '@/config';
import styles from '../checkout.module.css';
import MessageBox from '@/components/ui/MessageBox';

// TODO: реалните офиси могат да се зареждат от API/конфиг.
const ECONT_OFFICES = [
    'София - Офис Център (пример)',
    'Пловдив - Офис 1 (пример)',
    'Варна - Офис 1 (пример)',
];

const SPEEDY_OFFICES = [
    'София - Спиди Офис 1 (пример)',
    'Пловдив - Спиди Офис 1 (пример)',
    'Бургас - Спиди Офис 1 (пример)',
];

export default function ShippingPage() {
    const router = useRouter();
    const { cartItems, getTotalPrice, clearCart } = useCart();

    const [orderDraft, setOrderDraft] = useState(null);
    const [shippingMethod, setShippingMethod] = useState(''); // 'econt' | 'speedy' | 'boxnow'
    const [econtOffice, setEcontOffice] = useState('');
    const [speedyOffice, setSpeedyOffice] = useState('');
    const [boxNow, setBoxNow] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalPrice = getTotalPrice();

    // Зареждаме черновата от localStorage
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const raw = window.localStorage.getItem('hc_order_draft');

        if (!raw) {
            router.push('/checkout');
            return;
        }

        try {
            const parsed = JSON.parse(raw);
            // Тази стъпка е само за наложен платеж
            if (!parsed || parsed.paymentMethod !== 'cod') {
                router.push('/checkout');
                return;
            }
            setOrderDraft(parsed);
        } catch (err) {
            console.error('Грешка при четене на чернова на поръчката:', err);
            router.push('/checkout');
        }
    }, [router]);

    // Ако количката е празна, връщаме към магазина,
    // НО не и след успешна поръчка (тогава искаме да покажем съобщението).
    useEffect(() => {
        if (cartItems.length === 0 && !successMessage) {
            router.push('/products');
        }
    }, [cartItems.length, successMessage, router]);

    // Авто-скриване на съобщенията + redirect при успех
    useEffect(() => {
        if (!errorMessage && !successMessage) return;

        const timer = setTimeout(() => {
            setErrorMessage('');
            setSuccessMessage('');

            if (successMessage) {
                router.push('/products');
            }
        }, 4000); // 4 секунди

        return () => clearTimeout(timer);
    }, [errorMessage, successMessage, router]);

    const handleEcontChange = (e) => {
        const value = e.target.value;

        setEcontOffice(value);
        if (value) {
            setShippingMethod('econt');
            setSpeedyOffice('');
            setBoxNow(false);
        } else if (shippingMethod === 'econt') {
            setShippingMethod('');
        }
    };

    const handleSpeedyChange = (e) => {
        const value = e.target.value;

        setSpeedyOffice(value);
        if (value) {
            setShippingMethod('speedy');
            setEcontOffice('');
            setBoxNow(false);
        } else if (shippingMethod === 'speedy') {
            setShippingMethod('');
        }
    };

    const handleBoxNowChange = (e) => {
        const checked = e.target.checked;
        setBoxNow(checked);

        if (checked) {
            setShippingMethod('boxnow');
            setEcontOffice('');
            setSpeedyOffice('');
        } else if (shippingMethod === 'boxnow') {
            setShippingMethod('');
        }
    };

    // ВЕРСИЯ С .then() / .catch()
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!orderDraft) {
            setErrorMessage('Липсва информация за поръчката. Моля, опитайте отново.');
            return;
        }

        if (!shippingMethod) {
            setErrorMessage('Моля, изберете начин на доставка.');
            return;
        }

        if (shippingMethod === 'econt' && !econtOffice) {
            setErrorMessage('Моля, изберете офис на Еконт.');
            return;
        }

        if (shippingMethod === 'speedy' && !speedyOffice) {
            setErrorMessage('Моля, изберете офис на Спиди.');
            return;
        }

        setIsSubmitting(true);

        fetch(`${baseURL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...orderDraft,
                paymentMethod: 'cod',
                cartItems,
                totalPrice,
                shippingMethod,
                econtOffice,
                speedyOffice,
                boxNow,
            }),
        })
            .then((res) =>
                res.json().then((data) => ({
                    ok: res.ok,
                    data,
                }))
            )
            .then(({ ok, data }) => {
                if (!ok) {
                    throw new Error(
                        data?.message || 'Възникна грешка при финализиране на поръчката.'
                    );
                }

                setSuccessMessage(
                    'Благодарим ви за поръчката! Ще се свържем с вас при първа възможност.'
                );

                // Чистим количката и черновата
                clearCart();
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('hc_order_draft');
                }
            })
            .catch((err) => {
                console.error('Грешка при финализиране на поръчката:', err);
                setErrorMessage(
                    err.message ||
                    'Възникна грешка при финализиране на поръчката. Моля, опитайте отново.'
                );
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    if (!orderDraft) {
        // Кратко "loading" състояние, докато се зареди черновата или redirect-не
        return (
            <section className={styles.checkoutContainer}>
                <h1 className={styles.heading}>Избор на доставка</h1>
                <p>Зареждане...</p>
            </section>
        );
    }

    return (
        <section className={styles.checkoutContainer}>
            {!successMessage && (
                <h1 className={styles.heading}>Избор на доставка</h1>
            )}
            {/* Ако има успешно съобщение → показваме САМО него */}
            {successMessage ? (
                <div style={{ marginTop: '40px' }}>
                    <MessageBox type="success" message={successMessage} />
                </div>
            ) : (
                <div className={styles.columns}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h2 className={styles.subheading}>Къде да изпратим пратката?</h2>

                        {errorMessage && (
                            <MessageBox type="error" message={errorMessage} />
                        )}

                        <div className={styles.field}>
                            <label htmlFor="econtOffice">Доставка до офис на Еконт</label>
                            <select
                                id="econtOffice"
                                value={econtOffice}
                                onChange={handleEcontChange}
                            >
                                <option value="">Изберете офис на Еконт</option>
                                {ECONT_OFFICES.map((office) => (
                                    <option key={office} value={office}>
                                        {office}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="speedyOffice">Доставка до офис на Спиди</label>
                            <select
                                id="speedyOffice"
                                value={speedyOffice}
                                onChange={handleSpeedyChange}
                            >
                                <option value="">Изберете офис на Спиди</option>
                                {SPEEDY_OFFICES.map((office) => (
                                    <option key={office} value={office}>
                                        {office}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.paymentOption}>
                                <input
                                    type="checkbox"
                                    checked={boxNow}
                                    onChange={handleBoxNowChange}
                                />
                                <span>Доставка през Box Now</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Изпращане...' : 'Потвърди'}
                        </button>
                    </form>

                    {/* Дясна колона – резюме на поръчката */}
                    <aside className={styles.summary}>
                        <h2 className={styles.subheading}>Вашата поръчка</h2>
                        <p className={styles.itemMeta}>
                            Клиент: {orderDraft.name} ({orderDraft.phone})
                        </p>
                        <p className={styles.itemMeta}>Град: {orderDraft.city}</p>
                        <p className={styles.itemMeta}>Адрес: {orderDraft.address}</p>

                        <ul className={styles.itemsList}>
                            {cartItems.map((item) => (
                                <li key={item._id} className={styles.itemRow}>
                                    <div>
                                        <p className={styles.itemTitle}>{item.title}</p>
                                        <p className={styles.itemMeta}>
                                            Количество: {item.quantity} × {item.price.toFixed(2)} лв.
                                        </p>
                                    </div>
                                    <p className={styles.itemTotal}>
                                        {(item.quantity * item.price).toFixed(2)} лв.
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <div className={styles.totalRow}>
                            <span>Общо:</span>
                            <strong>{totalPrice.toFixed(2)} лв.</strong>
                        </div>
                    </aside>
                </div>
            )}
        </section>
    );
}
