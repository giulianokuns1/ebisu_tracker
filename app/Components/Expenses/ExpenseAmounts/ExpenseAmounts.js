import React from 'react';
import styles from "@/Components/Expenses/Expenses.module.scss";
import { useTranslation } from '@/Hooks/useTranslation';

const ExpenseAmounts = ({ expenseAmounts, setExpenseAmountsAmount, setExpenseAmountsCurrency, currencies, validateAmount, validateCurrency, amountError, currencyError, handleDeleteExpenseAmount, handleAddExpenseAmount }) => {
    const { t } = useTranslation();

    const handleAmountChange = (e, index) => {
        const newValue = e.target.value;
        const currentAmount = expenseAmounts[index]?.amount;
        if ((currentAmount === "0" || currentAmount === 0) && newValue !== "" && newValue !== "0") {
            if (newValue === "0." || newValue.startsWith("0.")) {
                setExpenseAmountsAmount(newValue, index);
            } else if (/^0[1-9]/.test(newValue)) {
                setExpenseAmountsAmount(newValue.substring(1), index);
            } else {
                setExpenseAmountsAmount(newValue, index);
            }
        } else {
            setExpenseAmountsAmount(newValue, index);
        }
    };

    const handleAmountFocus = (index) => {
        const currentAmount = String(expenseAmounts[index]?.amount ?? '');
        if (Number(currentAmount) === 0) setExpenseAmountsAmount('', index);
    };

    return (
        <div>
            {expenseAmounts &&
                <div className={`${styles.formAmountCurrencyContainer} ${styles.amountTableHeader}`}>
                    <label className={styles.formTableLabel}>{t('Amount')}</label>
                    <label className={styles.formTableLabel}>{t('Currency')}</label>
                    <label className={styles.formTableLabel}>{t('')}</label>
                </div>
            }
            {expenseAmounts &&
                expenseAmounts.map((expenseAmount, index) => (
                    <div key={index} className={styles.formAmountCurrencyContainer}>
                        <div className={styles.formInputWrapper}>
                            <input
                                className={styles.inputText}
                                type="number"
                                value={expenseAmount.amount}
                                onFocus={() => handleAmountFocus(index)}
                                onChange={(e) => handleAmountChange(e, index)}
                                onBlur={validateAmount}
                            />
                        </div>
                        <div className={styles.formInputWrapper}>
                            <div className={styles.selectWrapper}>
                                <select
                                    className={styles.currencySelect}
                                    value={expenseAmount.currency_id || ''}
                                    onChange={(e) => setExpenseAmountsCurrency(e.target.value, index)}
                                    onBlur={validateCurrency}
                                >
                                    {currencies &&
                                        currencies.map((currency) => (
                                            <option key={currency.id} value={currency.id}>
                                                {currency.name} {currency.symbol}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={expenseAmounts && expenseAmounts.length > 1 ? styles.removeExpenseAmountButton : styles.disabledRemoveExpenseAmountButton}
                            onClick={(e) => {
                                if (expenseAmounts && expenseAmounts.length > 1) {
                                    handleDeleteExpenseAmount(e, expenseAmount.id, index);
                                }
                            }}
                        >
                            <i className="bi bi-dash-circle-fill"></i>
                        </button>
                    </div>
                ))}
            <div className={styles.formAmountAddContainer}>
                <button type="button" className={styles.addExpenseAmountButton} onClick={handleAddExpenseAmount}>
                    <i className="bi bi-plus-circle"></i> {t('Add amount in another currency')}
                </button>
            </div>
            <div className={styles.inputError}>{amountError}</div>
            <div className={styles.inputError}>{currencyError}</div>
        </div>
    );
};

export default ExpenseAmounts;
