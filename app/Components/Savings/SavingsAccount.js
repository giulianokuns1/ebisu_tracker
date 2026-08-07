import styles from './Savings.module.scss';
import React from "react";
import { useTranslation } from '@/Hooks/useTranslation';
import { useRouter } from "next/router";

const SavingsAccount = ({ savingsAccount }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const savingsAccountsArray = Object.values(savingsAccount);

    return (
        <div className={styles.savingAccountsContainer}>
            <div className={styles.savingAccountsListContainer}>
                {savingsAccountsArray.map((sa, index) => (
                    <div key={`${'sa_'}${index}`} className={styles.savingAccountsCard}>
                        <div className={styles.savingAccountName}>{sa.accountName}</div>
                        <div className={styles.savingAccountAmount}>{sa.totalAmount}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavingsAccount;
