import React, { useState } from 'react';
import styles from "@/Components/UI/Form/Form.module.scss";
import { useTranslation } from '@/Hooks/useTranslation';

const FormSelect = ({ label, values, valueLabel, multipleValueLabel, value, onChange, onBlur, errorMessage, defaultLabel, multiple, hideDefault }) => {
    const { t } = useTranslation();

    return (
        <div className={styles.formInputWrapper}>
            <label className={styles.formInputLabel}>{label}</label>
            <div className={styles.selectWrapper}>
                <select
                    className={styles.inputText}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    multiple={!!multiple}
                >
                    {!hideDefault && <option value="" disabled> {defaultLabel}</option>}
                    {values &&
                        values.map((v) => (
                            <option key={v.id} value={v.id}>
                                {multipleValueLabel ? multipleValueLabel.map((label) => v[label]).join(' ') : t(v[valueLabel])}
                            </option>
                        ))}
                </select>
                <div className={styles.inputError}>{errorMessage}</div>
            </div>
        </div>
    );
};

export default FormSelect;
