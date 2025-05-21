// 'use client';
// import styles from './register.module.css';
// import { useEffect } from 'react';

// import MessageBox from '@/components/ui/MessageBox';
// import { onRegisterSubmit } from '@/managers/userManager';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import useForm from '@/hooks/useForm';
// import { handleSubmit } from '@/utils/formSubmitHelper';
// import { passwordsMatchValidator } from '@/utils/formValidations';

// export default function Register() {
//   const router = useRouter();
//   const { setUser } = useAuth();

//   const {
//     formValues,
//     setFormValues,
//     error,
//     setError,
//     success,
//     setSuccess,
//     invalidFields,
//     setInvalidFields,
//     handleChange
//   } = useForm({
//     username: '',
//     email: '',
//     password: '',
//     repeatPassword: '',
//   });

//   useEffect(() => {
//     if (success) {
//       router.push('/products');
//     }
//   }, [success, router]);

//   return (
//     <div className={styles.registerFormContainer}>
//       {error && <MessageBox type="error" message={`Неуспешна регистрация: ${error}`} />}
//       {success && <MessageBox type="success" message="Регистрирахте се успешно" />}
//       <legend>Регистрация</legend>

//       <form
//         className={styles.registerForm}
//         onSubmit={(e) =>
//           handleSubmit(
//             e,
//             formValues,
//             setFormValues,
//             setSuccess,
//             setError,
//             setInvalidFields,
//             (values, setSuccess, setError, setInvalidFields) =>
//               onRegisterSubmit(values, setSuccess, setError, setInvalidFields, setUser),
//             [passwordsMatchValidator]
//           )
//         }
//       >
//         <label htmlFor="username">Username</label>
//         <input
//           name="username"
//           value={formValues.username}
//           onChange={handleChange}
//           className={invalidFields.includes('username') ? styles.invalidField : ''}
//         />

//         <label htmlFor="email">Email</label>
//         <input
//           name="email"
//           value={formValues.email}
//           onChange={handleChange}
//           className={invalidFields.includes('email') ? styles.invalidField : ''}
//         />

//         <label htmlFor="password">Password</label>
//         <input
//           type="password"
//           name="password"
//           value={formValues.password}
//           onChange={handleChange}
//           className={invalidFields.includes('password') ? styles.invalidField : ''}
//         />

//         <label htmlFor="repeatPassword">Repeat Password</label>
//         <input
//           type="password"
//           name="repeatPassword"
//           value={formValues.repeatPassword}
//           onChange={handleChange}
//           className={invalidFields.includes('repeatPassword') ? styles.invalidField : ''}
//         />

//         <button type="submit">Register</button>
//       </form>
//     </div>
//   );
// }


import RegisterForm from './RegisterForm';

export const metadata = {
  title: 'Регистрация | Happy Colors',
  description: 'Създай профил в Happy Colors и се включи в нашата цветна общност.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
