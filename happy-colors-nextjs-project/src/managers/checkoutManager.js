// happy-colors-nextjs-project/src/managers/checkoutManager.js
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import baseURL from '@/config';

const ORDER_DRAFT_KEY = 'hc_order_draft';
const SHIPPING_STORAGE_KEY = 'hc_shipping_choice';

// TODO: реалните офиси могат да се зареждат от API/конфиг.
export const ECONT_OFFICES = [
  'София - Офис Център (пример)',
  'Пловдив - Офис 1 (пример)',
  'Варна - Офис 1 (пример)',
];

export const SPEEDY_OFFICES = [
  'София - Спиди Офис 1 (пример)',
  'Пловдив - Спиди Офис 1 (пример)',
  'Бургас - Спиди Офис 1 (пример)',
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
