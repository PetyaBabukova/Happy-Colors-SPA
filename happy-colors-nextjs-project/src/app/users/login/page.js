import React from 'react'
import styles from './login.module.css';

export default function Login() {
    return (
        <div className={styles.registerFormContainer}>
            <legend>Login</legend>
            <form className={styles.registerForm} method="POST" action="/users/register">
                <label htmlFor="username">Username</label>
                <input type="text" name="username" id="username" placeholder='Username'/>

                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" placeholder='Password'/>

                <button >Login</button>
            </form>
        </ div>
    )
}
