'use client';
import styles from './create.module.css';
import MessageBox from '@/components/ui/MessageBox';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import useForm from '@/hooks/useForm';
import { handleSubmit } from '@/utils/formSubmitHelper';
import { passwordsMatchValidator } from '@/utils/formValidations';

export default function Register() {
    const router = useRouter();
    const { setUser } = useAuth();

    const {
        formValues,
        setFormValues,
        error,
        setError,
        success,
        setSuccess,
        invalidFields,
        setInvalidFields,
        handleChange
    } = useForm({
        username: '',
        email: '',
        password: '',
        repeatPassword: '',
    });

    return (
        <div className={styles.registerFormContainer}>
            {error && <MessageBox type="error" message={`Неуспешна регистрация: ${error}`} />}
            {success && <MessageBox type="success" message="Регистрирахте се успешно" />}
            <legend>Създаване на нов продукт</legend>

            <form
                className={styles.registerForm}
                onSubmit={(e) =>
                    handleSubmit(
                        e,
                        formValues,
                        setFormValues,
                        setSuccess,
                        setError,
                        setInvalidFields,
                        (values, setSuccess, setError, setInvalidFields) =>
                            onRegisterSubmit(values, setSuccess, setError, setInvalidFields, setUser, router),
                        [passwordsMatchValidator]
                    )
                }
            >
                <label htmlFor="username">Име на продукта</label>
                <input
                    name="title"
                    value={formValues.title}
                    onChange={handleChange}
                    className={invalidFields.includes('title') ? styles.invalidField : ''}
                />

                <label htmlFor="description">Описание</label>
                <input
                    name="description"
                    value={formValues.description}
                    onChange={handleChange}
                    className={invalidFields.includes('description') ? styles.invalidField : ''}
                />

                <label htmlFor="category">Категория</label>
                <input
                    name="category"
                    value={formValues.category}
                    onChange={handleChange}
                    className={invalidFields.includes('category') ? styles.invalidField : ''}
                />

                <label htmlFor="price">Цена</label>
                <input
                    type="number"
                    name="price"
                    value={formValues.price}
                    onChange={handleChange}
                    className={invalidFields.includes('price') ? styles.invalidField : ''}
                />


                <button type="submit">Създай продукт</button>
            </form>
        </div>
    );
}