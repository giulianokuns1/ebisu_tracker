import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import styles from '@/Components/YearFilters/YearFilters.module.scss';

const YearFilter = ({ onYearChange, defaultYear = '' }) => {
    const { t } = useTranslation();
    const [selectedYear, setSelectedYear] = useState(defaultYear);

    useEffect(() => {
        setSelectedYear(defaultYear);
    }, [defaultYear]);

    // Generate years from today to 10 years ago
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i <= 10; i++) {
        years.push(currentYear - i);
    }

    const handleYearChange = (event) => {
        const year = event.target.value;
        setSelectedYear(year);
        onYearChange(year);
    };

    return (
        <div className={styles.yearFilterContainer}>
            <div className={styles.yearSelectContainer}>
                <label className={styles.formInputLabel}>{t('Year')}</label>
                <div className={styles.selectWrapper}>
                    <select
                        className={styles.inputText}
                        value={selectedYear}
                        onChange={handleYearChange}
                    >
                        <option value="" disabled>{t('Select a Year')}</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default YearFilter;

