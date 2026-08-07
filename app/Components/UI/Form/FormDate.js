import React, { useState } from 'react';
import styles from "@/Components/UI/Form/Form.module.scss";
import { useTranslation } from '@/Hooks/useTranslation';
import DatePicker from "react-datepicker";

const FormDate = ({ label, value, onChange, onBlur, errorMessage }) => {
    const { t } = useTranslation();

    return (
        <div className={styles.formDateWrapper}>
            <label className={styles.formInputLabel}>{label}</label>
            <DatePicker
                selected={value}
                onChange={onChange}
                onBlur={onBlur}
                dateFormat="dd/MM/yyyy"
            />
            {errorMessage && (
                <div className={`${styles.inputError} ${customErrorClass}`}>{t(errorMessage)}</div>
            )}
        </div>
    );
};

export default FormDate;
