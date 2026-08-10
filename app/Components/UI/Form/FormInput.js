import React, { useState } from 'react';
import styles from "@/Components/UI/Form/Form.module.scss";
import { useTranslation } from '@/Hooks/useTranslation';

const FormInput = ({ label, type, value, onChange, onBlur, errorMessage, name, customErrorClass, min, max, showPasswordToggle = false }) => {
    const { t } = useTranslation();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === 'password';

    return (
        <div className={styles.formInputWrapper}>
            <label className={styles.formInputLabel}>{t(label)}</label>
            <div className={showPasswordToggle && isPasswordField ? styles.passwordInput : undefined}>
                <input
                    className={styles.inputText}
                    type={isPasswordField && isPasswordVisible ? 'text' : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    min={min}
                    max={max}
                />
                {showPasswordToggle && isPasswordField && (
                    <button
                        className={styles.passwordToggle}
                        type="button"
                        onClick={() => setIsPasswordVisible((visible) => !visible)}
                        aria-label={isPasswordVisible ? t('Hide password') : t('Show password')}
                    >
                        <i className={isPasswordVisible ? 'bi bi-eye-slash' : 'bi bi-eye'} aria-hidden="true" />
                    </button>
                )}
            </div>
            {errorMessage && (
                <div className={`${styles.inputError} ${customErrorClass}`}>{t(errorMessage)}</div>
            )}
        </div>
    );
};

export default FormInput;
