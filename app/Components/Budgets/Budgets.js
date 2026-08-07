import styles from './Budgets.module.scss';
import React, {useRef} from "react";
import { useTranslation } from '@/Hooks/useTranslation';
import { useRouter } from "next/router";

const Budgets = ({ budgets }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const formatDate = (isoDateString) => {
        const options = {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        };
        const date = new Date(isoDateString);
        return date.toLocaleDateString(undefined, options);
    };
    const handleEditBudget = (budgetId) => {
        router.push('/budgets/details/' + budgetId);
    }
    return (
        <div>
            <div className={styles.budgetListContainer}>
                {budgets.map((budget) => (
                    <div key={budget.id} className={styles.budgetCard}>
                        <div className={styles.categoryContainer}>
                            <div className={styles.categoryIconContainer}>
                                <i className={`${budget.category_icon} ${styles.categoryIcon}`}></i>
                            </div>
                            <div className={styles.categoryName}>{budget.category_name}</div>
                        </div>
                        <div className={styles.mainCardContainer} onClick={() => handleEditBudget(budget.id)}>
                            <div className={styles.name}>{budget.name}</div>
                            <div className={styles.dateFrecuencyContainer}>
                                <div className={styles.dateFrecuency}>{formatDate(budget.created_at)}</div>
                            </div>
                        </div>
                        <div className={styles.amountContainer}>
                            <div className={styles.amount}>{budget.currency_symbol} {budget.amount}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Budgets;
