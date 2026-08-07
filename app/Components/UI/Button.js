import React from 'react';
import styles from './Button.module.scss';

const Button = ({ label, onClick, type, customClass }) => {
    return (
        <button className={`${customClass ? customClass : ''} ${styles.button}`} onClick={onClick} type={type}>
            {label}
        </button>
    );
};

export default Button;
