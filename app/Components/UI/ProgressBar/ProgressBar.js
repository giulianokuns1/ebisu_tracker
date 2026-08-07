import styles from './ProgressBar.module.scss';
import React, { useEffect, useState } from 'react';

const ProgressBar = ({ value, maxValue, isFullPaid }) => {
    const [percentage, setPercentage] = useState(0);
    const [realPercentage, setRealPercentage] = useState(0);
    useEffect(() => {
        const calculatedPercentage = maxValue && maxValue > 0 ? (value / maxValue) * 100 : value > maxValue ? 100 : 100;
        setPercentage(calculatedPercentage);
        setRealPercentage(calculatedPercentage);
        if (isFullPaid) {
            setPercentage(100);
        }
    }, [value, maxValue, isFullPaid]);

    return (
        <div className={styles.progressBarContainer}>
            <div className={styles.progressBar}>
                <div
                    className={percentage >= 100 ? styles.progressBarFillFull : styles.progressBarFill}
                    style={{ width: `${percentage}%` }}
                >
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
