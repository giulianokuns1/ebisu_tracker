import React from 'react';
import Login from '@/Components/LoginRegister/Login/Login';
import Register from '@/Components/LoginRegister/Register/Register';
import styles from './LoginRegister.module.scss';

function LoginRegister() {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.formsRow}>
                <section className={styles.formSection} id="login">
                    <Login />
                </section>
                <section className={styles.formSection} id="register">
                    <Register titleClass={styles.registerTitle} />
                </section>
            </div>
        </div>
    );
}

export default LoginRegister;
