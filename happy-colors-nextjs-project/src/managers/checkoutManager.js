// happy-colors-nextjs-project/src/managers/checkoutManager.js
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import baseURL from '@/config';

const ORDER_DRAFT_KEY = 'hc_order_draft';
const SHIPPING_STORAGE_KEY = 'hc_shipping_choice';

export const ECONT_OFFICES = [
  { address: 'гр. София бул. Тодор Александров 8', street: 'Тодор Александров 8', isAps: true },
  { address: 'гр. София ул. Капитан Райчо 56', street: 'Капитан Райчо 56', isAps: false },
  { address: 'гр. София ул. Преслав 20', street: 'Преслав 20', isAps: false },
];

export const SPEEDY_OFFICES = [
  { address: 'Пловдив Брезовско Шосе 147', street: 'Брезовско Шосе 147', isAps: false },
  { address: 'Пловдив Индустриална 5', street: 'Индустриална 5', isAps: false },
  { address: 'Пловдив Опълченска 66', street: 'Опълченска 66', isAps: false },
];

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(String(email || '').trim());
}

function isValidPhone(phone) {
  const clean = String(phone || '').replace(/\s+/g, '').trim();
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
    paymentMethods: [],
  });

  const [shipping, setShipping] = useState({
    shippingMethod: '',
    econtOffice: '',
    speedyOffice: '',
    boxNow: false,
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      return {
        shippingMethod: 'boxnow',
        econtOffice: '',
        speedyOffice: '',
        boxNow: true,
      };
    });

    setErrors((prev) => ({
      ...prev,
      shippingMethod: '',
      econtOffice: '',
      speedyOffice: '',
      address: '',
    }));
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

    if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
      newErrors.paymentMethods = 'Моля, изберете начин на плащане';
    }

    if (!shipping.shippingMethod) {
      newErrors.shippingMethod = 'Моля, изберете начин на доставка';
    } else if (shipping.shippingMethod === 'econt' && !shipping.econtOffice) {
      newErrors.econtOffice = 'Моля, изберете офис на Еконт';
    } else if (shipping.shippingMethod === 'speedy' && !shipping.speedyOffice) {
      newErrors.speedyOffice = 'Моля, изберете офис на Спиди';
    } else if (shipping.shippingMethod === 'boxnow') {
      if (!address || address.length < 10) {
        newErrors.address = 'Моля, въведете адрес за доставка - минимум 10 символа';
      }
    }

    return newErrors;
  }, [formData, shipping]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function fetchOffices() {
      if (shipping.shippingMethod === 'econt') {
        setEcontOffices([]);
      } else if (shipping.shippingMethod === 'speedy') {
        setSpeedyOffices([]);
      }

      const cityTrimmed = (formData.city || '').trim();

      if (
        !shipping.shippingMethod ||
        shipping.shippingMethod === 'boxnow' ||
        !cityTrimmed
      ) {
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
            setEcontOffices(Array.isArray(data.offices) ? data.offices : []);
          } else if (shipping.shippingMethod === 'speedy') {
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
  }, [shipping.shippingMethod, formData.city]);

  const persistDraftAndShipping = useCallback(() => {
    const draft = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      address: shipping.shippingMethod === 'boxnow' ? formData.address.trim() : '',
      note: formData.note.trim(),
      paymentMethod,
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

        if (typeof window !== 'undefined') {
          window.location.href = data.url;
        }

        return;
      }

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