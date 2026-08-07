import React, { useState } from 'react';
import styles from "@/Components/UI/Form/Form.module.scss";
import { useTranslation } from '@/Hooks/useTranslation';

const FormInput = ({ label, type, value, onChange, onBlur, errorMessage, name, customErrorClass, min, max }) => {
    const { t } = useTranslation();

    return (
        <div className={styles.formInputWrapper}>
            <label className={styles.formInputLabel}>{t(label)}</label>
            <input
                className={styles.inputText}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                min={min}
                max={max}
            />
            {errorMessage && (
                <div className={`${styles.inputError} ${customErrorClass}`}>{t(errorMessage)}</div>
            )}
        </div>
    );
};

export default FormInput;
