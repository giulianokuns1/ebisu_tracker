import React, { useState } from 'react';
import styles from "@/Components/UI/Form/Form.module.scss";
import { useTranslation } from '@/Hooks/useTranslation';
import {MultiSelect} from "primereact/multiselect";

const FormSelect = ({ label, values, optionLabel, value, onChange, errorMessage, placeHolder, maxSelectedLabels, className }) => {
    const { t } = useTranslation();
    return (
        <div className={styles.formInputWrapper}>
            <label className={styles.formInputLabel}>{label}</label>
            <div className={styles.selectWrapper}>
                <MultiSelect
                    value={value}
                    onChange={onChange}
                    options={values}
                    optionLabel={optionLabel}
                    placeholder={placeHolder}
                    maxSelectedLabels={maxSelectedLabels}
                    className={className}
                />
                <div className={styles.inputError}>{errorMessage}</div>
            </div>
        </div>
    );
};

export default FormSelect;
