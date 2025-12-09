// happy-colors-nextjs-project/src/checkoutManager.js
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export function useCheckoutManager() {
  const router = useRouter();
  const { cartItems, getTotalPrice } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    note: '',
    paymentMethods: [], // 'card' или 'cod'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = getTotalPrice();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  }, []);

  const handlePaymentChange = useCallback((method) => {
    setFormData((prev) => {
      const isSelected = prev.paymentMethods.includes(method);
      // визуално чекбокс, логически – само 1 избор
      const newMethods = isSelected ? [] : [method];

      return {
        ...prev,
        paymentMethods: newMethods,
      };
    });

    setErrors((prev) => ({
      ...prev,
      paymentMethods: '',
    }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Моля, въведете име и фамилия.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Моля, въведете телефон.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Моля, въведете град.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Моля, въведете адрес за доставка.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Моля, въведете e-mail.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Моля, въведете валиден e-mail.';
    }

    if (!formData.paymentMethods || formData.paymentMethods.length === 0) {
      newErrors.paymentMethods = 'Моля, изберете начин на плащане.';
    }

    return newErrors;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      const newErrors = validate();

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      const paymentMethod = formData.paymentMethods[0]; // 'card' или 'cod'

      // Подготвяме чернова на поръчката,
      // която ще се довърши на следващата стъпка (доставка или картово плащане)
      const orderDraft = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        note: formData.note.trim(),
        paymentMethod,
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hc_order_draft', JSON.stringify(orderDraft));
      }

      if (paymentMethod === 'cod') {
        // Наложен платеж → стъпка 2: избор на доставка
        router.push('/checkout/shipping');
      } else if (paymentMethod === 'card') {
        // Плащане с карта – засега placeholder страница за бъдеща интеграция
        router.push('/checkout/card-payment');
      }

      setIsSubmitting(false);
    },
    [formData, validate, router]
  );

  return {
    cartItems,
    totalPrice,
    formData,
    errors,
    isSubmitting,
    handleChange,
    handlePaymentChange,
    handleSubmit,
  };
}
