import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import styles from '@/Components/MonthFilters/MonthFilters.module.scss';
import {InputSwitch} from "primereact/inputswitch";

const MonthFilter = ({ onMonthChange, defaultMonth = '', displayShowAll = false, onShowAllChange, showAllChecked, toolbar = false }) => {
    const { t } = useTranslation();
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

    useEffect(() => {
        setSelectedMonth(defaultMonth);
    }, [defaultMonth]);

    const handleMonthChange = (event) => {
        const month = event.target.value;
        setSelectedMonth(month);
        onMonthChange(month);
    };

    return (
        <div className={`${styles.monthFilterContainer} ${toolbar ? styles.toolbar : ''}`}>
            {displayShowAll && (
                <div className={styles.monthFilterAll}>
                    <label className={styles.checkboxLabel}>{t('Show All')}</label>
                    <InputSwitch
                        checked={showAllChecked}
                        onChange={onShowAllChange}
                        className={styles.checkboxInput}
                    />
                </div>
            )}
            <div className={styles.monthSelectContainer}>
                <label className={styles.formInputLabel}>{t('Month')}</label>
                <div className={styles.selectWrapper}>
                    <select
                        className={styles.inputText}
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        disabled={showAllChecked}
                    >
                        <option value="" disabled> {t('Select a Month')}</option>
                        <option value="01">{t('January')}</option>
                        <option value="02">{t('February')}</option>
                        <option value="03">{t('March')}</option>
                        <option value="04">{t('April')}</option>
                        <option value="05">{t('May')}</option>
                        <option value="06">{t('June')}</option>
                        <option value="07">{t('July')}</option>
                        <option value="08">{t('August')}</option>
                        <option value="09">{t('September')}</option>
                        <option value="10">{t('October')}</option>
                        <option value="11">{t('November')}</option>
                        <option value="12">{t('December')}</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default MonthFilter;
