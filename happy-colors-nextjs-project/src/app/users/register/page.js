import React from 'react'
import styles from './register.module.css';

export default function Register() {
    return (
        <div className={styles.registerFormContainer}>
            <legend>Register form</legend>
            <form className={styles.registerForm} method="POST" action="/users/register">
                <label for="username">Username</label>
                <input type="text" name="username" id="username" placeholder='Username'/>

                <label for="email">Email</label>
                <input type="email" name="email" id="email" placeholder='Email'/>

                <label for="password">Password</label>
                <input type="password" name="password" id="password" placeholder='Password'/>

                <label for="repeatPassword">Repeat Password</label>
                <input type="password" name="repeatPassword" id="repeatPassword" placeholder='Repeat Password'/>

                <button >Register</button>
            </form>
        </ div>
    )
}
