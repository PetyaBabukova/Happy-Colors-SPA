// happy-colors-nextjs-project/src/managers/checkoutManager.js
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import baseURL from '@/config';

const ORDER_DRAFT_KEY = 'hc_order_draft';
const SHIPPING_STORAGE_KEY = 'hc_shipping_choice';

// TODO: реалните офиси могат да се зареждат от API/конфиг.
// По подразбиране включваме няколко статични примера, които се
// използват като резервен вариант, ако извличането на динамичните
// списъци от куриерските API се провали. За нуждите на динамичната
// интеграция вижте useEffect в useCheckoutManager.
// Fallback list of Econt offices used when the API fails or returns no data.
// These entries include a city name and an approximate address (rather than
// the office name) to better simulate what users expect to see. Feel free
// to adjust these examples to real addresses or remove them entirely once
// you have reliable API integration.
// Fallback Econt offices as objects. These contain only the street and number.
// The `isAps` flag indicates whether the office is an automated locker.
// Fallback Econt offices. Each object contains the full address string (as
// provided by Econt) and a derived `street` property used for sorting. When
// adding new entries ensure that `street` corresponds to the street/boulevard
// portion of the address (without city or neighbourhood). The `isAps` flag
// marks automated lockers.
export const ECONT_OFFICES = [
  { address: 'гр. София бул. Тодор Александров 8', street: 'Тодор Александров 8', isAps: true },
  { address: 'гр. София ул. Капитан Райчо 56', street: 'Капитан Райчо 56', isAps: false },
  { address: 'гр. София ул. Преслав 20', street: 'Преслав 20', isAps: false },
];

// Fallback list of Speedy offices used when the API fails or returns no data.
// These entries contain a city and an address, giving users more useful
// information than just a branch name.
// Fallback Speedy offices as objects. Each entry contains only the street and number.
// Fallback Speedy offices. Similar structure to Econt: `address` holds the
// full address string and `street` contains the street portion for sorting.
export const SPEEDY_OFFICES = [
  { address: 'Пловдив Брезовско Шосе 147', street: 'Брезовско Шосе 147', isAps: false },
  { address: 'Пловдив Индустриална 5', street: 'Индустриална 5', isAps: false },
  { address: 'Пловдив Опълченска 66', street: 'Опълченска 66', isAps: false },
];

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || '').trim());
}

// леко по-строга проверка, без да е “твърде” picky
function isValidPhone(phone) {
  const clean = String(phone || '').replace(/\s+/g, '').trim();
  // допуска +, цифри, минимум 8 цифри
  return /^\+?\d{8,15}$/.test(clean);
}

export function useCheckoutManager() {
  const router = useRouter();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const totalPrice = useMemo(() => getTotalPrice(), [getTotalPrice]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    note: '',
    paymentMethods: [], // 'card' | 'cod' (визуално чекбокс, логически 1 избор)
  });

  // доставка (вече е част от Step 1)
  const [shipping, setShipping] = useState({
    shippingMethod: '', // 'econt' | 'speedy' | 'boxnow'
    econtOffice: '',
    speedyOffice: '',
    boxNow: false,
  });

  // modal Step 2
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // UI feedback
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Dynamic office lists ---
  // Lists of offices retrieved from our internal API routes. When the
  // corresponding courier shipping method is selected, these arrays are
  // populated via `useEffect`. If the network request fails, these lists
  // remain empty and the fallback static arrays defined above are used.
  const [econtOffices, setEcontOffices] = useState([]);
  const [speedyOffices, setSpeedyOffices] = useState([]);
  const [officesLoading, setOfficesLoading] = useState(false);

  const paymentMethod = formData.paymentMethods?.[0] || '';

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handlePaymentChange = useCallback((method) => {
    setFormData((prev) => {
      const isSelected = prev.paymentMethods.includes(method);
      const newMethods = isSelected ? [] : [method];
      return { ...prev, paymentMethods: newMethods };
    });

    setErrors((prev) => ({ ...prev, paymentMethods: '' }));
  }, []);

  // radio: econt/speedy/boxnow
  const setShippingMethod = useCallback((method) => {
    setShipping((prev) => {
      if (method === 'econt') {
        return {
          shippingMethod: 'econt',
          econtOffice: prev.econtOffice || '',
          speedyOffice: '',
          boxNow: false,
        };
      }
      if (method === 'speedy') {
        return {
          shippingMethod: 'speedy',
          econtOffice: '',
          speedyOffice: prev.speedyOffice || '',
          boxNow: false,
        };
      }
      // boxnow
      return {
        shippingMethod: 'boxnow',
        econtOffice: '',
        speedyOffice: '',
        boxNow: true,
      };
    });

    setErrors((prev) => ({ ...prev, shippingMethod: '' }));
  }, []);

  const setEcontOffice = useCallback((value) => {
    setShipping((prev) => ({
      ...prev,
      shippingMethod: 'econt',
      econtOffice: value,
      speedyOffice: '',
      boxNow: false,
    }));
    setErrors((prev) => ({ ...prev, econtOffice: '' }));
  }, []);

  const setSpeedyOffice = useCallback((value) => {
    setShipping((prev) => ({
      ...prev,
      shippingMethod: 'speedy',
      econtOffice: '',
      speedyOffice: value,
      boxNow: false,
    }));
    setErrors((prev) => ({ ...prev, speedyOffice: '' }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const city = formData.city.trim();
    const address = formData.address.trim();
    const email = formData.email.trim();

    if (!name || name.length < 3 || name.length > 20) {
      newErrors.name = 'Моля, въведете име от 3 до 20 символа';
    }

    if (!phone || !isValidPhone(phone)) {
      newErrors.phone = 'Моля, въведете валиден телефонен номер';
    }

    if (!email || !isValidEmail(email)) {
      newErrors.email = 'Моля, въведете валиден e-mail';
    }

    if (!city) {
      newErrors.city = 'Моля, въведете град';
    }

    // адресът остава минимум 10 (както каза)
    if (!address || address.length < 10) {
      newErrors.address = 'Моля, въведете адрес за доставка - минимум 10 символа';
    }

    if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
      newErrors.paymentMethods = 'Моля, изберете начин на плащане';
    }

    // доставка
    if (!shipping.shippingMethod) {
      newErrors.shippingMethod = 'Моля, изберете начин на доставка';
    } else if (shipping.shippingMethod === 'econt' && !shipping.econtOffice) {
      newErrors.econtOffice = 'Моля, изберете офис на Еконт';
    } else if (shipping.shippingMethod === 'speedy' && !shipping.speedyOffice) {
      newErrors.speedyOffice = 'Моля, изберете офис на Спиди';
    }

    return newErrors;
  }, [formData, shipping]);

  // Fetch offices when the selected shipping method or city changes.
  // We watch the shipping method and city because the API allows
  // narrowing by city name. The fetches occur only in the browser
  // environment.
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    async function fetchOffices() {
      // Reset lists before fetching
      if (shipping.shippingMethod === 'econt') {
        // When switching to Econt, reset the list of offices so a fresh list can be loaded.
        setEcontOffices([]);
        // Do not call setSpeedyOffice here; clearing the selected office is handled in setShippingMethod
      } else if (shipping.shippingMethod === 'speedy') {
        // When switching to Speedy, reset the list of offices so a fresh list can be loaded.
        setSpeedyOffices([]);
        // Do not call setEcontOffice here; clearing the selected office is handled in setShippingMethod
      }
      // Do not call the API if no shipping method is selected or the city field is empty.
      const cityTrimmed = (formData.city || '').trim();
      if (!shipping.shippingMethod || !cityTrimmed) {
        return;
      }

      const cityQuery = encodeURIComponent(cityTrimmed);
      const url =
        shipping.shippingMethod === 'econt'
          ? `/api/offices/econt?city=${cityQuery}`
          : shipping.shippingMethod === 'speedy'
          ? `/api/offices/speedy?city=${cityQuery}`
          : null;
      if (!url) return;
      setOfficesLoading(true);
      try {
        const res = await fetch(url);
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data?.offices)) {
          if (shipping.shippingMethod === 'econt') {
            // Keep Econt offices as objects so that we can access
            // `address`, `isAps`, and identifiers on the client. We
            // assign the array directly. Fallback filtering and mapping
            // will occur in the page component.
            setEcontOffices(Array.isArray(data.offices) ? data.offices : []);
          } else if (shipping.shippingMethod === 'speedy') {
            // Keep Speedy offices as objects for the same reason.
            setSpeedyOffices(Array.isArray(data.offices) ? data.offices : []);
          }
        } else {
          console.warn('Failed to load offices', data);
        }
      } catch (err) {
        console.error('Office fetch error', err);
      } finally {
        setOfficesLoading(false);
      }
    }

    fetchOffices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipping.shippingMethod, formData.city]);

  const persistDraftAndShipping = useCallback(() => {
    const draft = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
      note: formData.note.trim(),
      paymentMethod: paymentMethod,
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ORDER_DRAFT_KEY, JSON.stringify(draft));
      window.localStorage.setItem(
        SHIPPING_STORAGE_KEY,
        JSON.stringify({
          shippingMethod: shipping.shippingMethod,
          econtOffice: shipping.econtOffice,
          speedyOffice: shipping.speedyOffice,
          boxNow: Boolean(shipping.boxNow),
        })
      );
    }

    return draft;
  }, [formData, paymentMethod, shipping]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setSubmitError('');
      setSubmitSuccess('');

      const newErrors = validate();
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsConfirmOpen(false);
        return;
      }

      // ✅ валидно → отваряме модала (Стъпка 2)
      setIsConfirmOpen(true);
    },
    [validate]
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  const confirmOrder = useCallback(async () => {
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmitting(true);

    try {
      const draft = persistDraftAndShipping();

      const payload = {
        ...draft,
        cartItems,
        totalPrice,
        shippingMethod: shipping.shippingMethod,
        econtOffice: shipping.econtOffice,
        speedyOffice: shipping.speedyOffice,
        boxNow: Boolean(shipping.boxNow),
      };

      // CARD → Stripe session
      if (paymentMethod === 'card') {
        const res = await fetch(`${baseURL}/payments/create-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || 'Грешка при стартиране на плащане с карта.');
        }
        if (!data?.url) {
          throw new Error('Липсва URL за плащане от Stripe.');
        }

        // редирект към Stripe
        if (typeof window !== 'undefined') {
          window.location.href = data.url;
        }
        return;
      }

      // COD → /orders
      const res = await fetch(`${baseURL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, paymentMethod: 'cod' }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Грешка при изпращане на поръчката.');
      }

      setSubmitSuccess('Поръчката ви е приета. Ще се свържем с вас при първа възможност.');

      // cleanup
      clearCart();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(ORDER_DRAFT_KEY);
        window.localStorage.removeItem(SHIPPING_STORAGE_KEY);
      }

      setIsConfirmOpen(false);

      setTimeout(() => {
        router.push('/products');
      }, 3000);
    } catch (err) {
      console.error('Confirm order error:', err);
      setSubmitError(
        err?.message || 'Възникна грешка. Моля, опитайте отново.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    persistDraftAndShipping,
    cartItems,
    totalPrice,
    shipping,
    paymentMethod,
    clearCart,
    router,
  ]);

  return {
    cartItems,
    totalPrice,

    formData,
    errors,
    isSubmitting,

    shipping,
    setShippingMethod,
    setEcontOffice,
    setSpeedyOffice,

    // dynamic offices
    econtOffices,
    speedyOffices,
    officesLoading,

    isConfirmOpen,
    closeConfirm,
    confirmOrder,

    submitError,
    submitSuccess,

    handleChange,
    handlePaymentChange,
    handleSubmit,
  };
}
