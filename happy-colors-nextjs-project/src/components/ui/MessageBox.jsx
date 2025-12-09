// happy-colors-nextjs-project/src/components/ui/MessageBox.jsx

'use client';
import React from 'react';
import styles from './MessageBox.module.css';

export default function MessageBox({ type = 'error', message }) {
    const boxClass = `${styles.message} ${type === 'success' ? styles.success : styles.error}`;

   

    return <div className={boxClass}>{message}</div>;
}
