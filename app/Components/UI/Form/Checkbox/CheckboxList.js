import React from 'react';
import styles from "@/Components/UI/Form/Checkbox/Checkbox.module.scss";
import { useTranslation } from '@/Hooks/useTranslation';
import {InputSwitch} from "primereact/inputswitch";

const CheckboxList = ({ label, checkboxList, onChange, onBlur, errorMessage, customErrorClass }) => {
    const { t } = useTranslation();

    return (
        <div className={styles.formCheckboxContainer}>
            <label className={styles.formInputLabel}>{label}</label>
            <div className={styles.formCheckboxList}>
                {checkboxList.map((checkbox, index) => (
                    <div className={styles.formInputWrapperCheckbox} key={index}>
                        <InputSwitch
                            checked={checkbox.checked}
                            onChange={onChange}
                            className={styles.checkboxInput}
                            onBlur={onBlur}
                            name={checkbox.value}
                        />
                        <label className={styles.checkboxLabel}>{t(checkbox.label)}</label>
                    </div>
                ))}
            </div>
            {errorMessage && (
                <div className={`${styles.inputError} ${customErrorClass}`}>{t(errorMessage)}</div>
            )}
        </div>
    );
};

export default CheckboxList;
