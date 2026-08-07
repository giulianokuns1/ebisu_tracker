import React from 'react';
import styles from "@/Components/UI/Form/Checkbox/Checkbox.module.scss";
import { useTranslation } from '@/Hooks/useTranslation';
import {InputSwitch} from "primereact/inputswitch";

const FormCheckbox = ({ label, checked, onChange, onBlur, errorMessage, customErrorClass, index, value }) => {
    const { t } = useTranslation();

    return (
        <div className={styles.formCheckboxContainer}>
            <div className={styles.formCheckboxList}>
                <div className={styles.formInputWrapperCheckbox} key={index}>
                    <InputSwitch
                        checked={checked}
                        onChange={onChange}
                        className={styles.checkboxInput}
                        onBlur={onBlur}
                        name={value}
                    />
                    <label className={styles.checkboxLabel}>{t(label)}</label>
                </div>
            </div>
            {errorMessage && (
                <div className={`${styles.inputError} ${customErrorClass}`}>{t(errorMessage)}</div>
            )}
        </div>
    );
};

export default FormCheckbox;
