import React from 'react'
import styles from './login.module.css';

export default function Register() {
    return (
        <div className={styles.registerFormContainer}>
            <legend>Login</legend>
            <form className={styles.registerForm} method="POST" action="/users/register">
                <label for="username">Username</label>
                <input type="text" name="username" id="username" placeholder='Username'/>

                <label for="password">Password</label>
                <input type="password" name="password" id="password" placeholder='Password'/>

                <button >Login</button>
            </form>
        </ div>
    )
}
