import styles from '@/Components/Expenses/ExpensesDetails.module.scss';
import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from "chart.js";
import {Doughnut} from "react-chartjs-2";

const ExpensesDetails = ({ expenses, expensesAmountByCurrency, data }) => {
    let chartDataByCurrency = {};
    const { t } = useTranslation();
    ChartJS.register(ArcElement, Tooltip, Legend);
    if (data && data.totalAmountByCurrency) {
        Object.keys(data.totalAmountByCurrency).forEach((currencyId) => {
            const currencyData = data.totalAmountByCurrency[currencyId];
            const currency = currencyData && currencyData.currency;
            const currencySymbol = currency && currency.symbol ? currency.symbol : '';

            if (!chartDataByCurrency[currencyId]) {
                chartDataByCurrency[currencyId] = {
                    labels: [t('Paid'), t('Pending')],
                    datasets: [],
                };
            }
            const dataset = {
                label: currencySymbol,
                data: [
                    data.amountPaidByCurrency[currencyId] || 0,
                    data.amountPendingByCurrency[currencyId] || 0,
                ],
                backgroundColor: [
                    '#51E0CF',
                    '#46435a',
                ],
                borderColor: [
                    '#51E0CF',
                    '#46435a',
                ],
                borderWidth: 1,
            };

            chartDataByCurrency[currencyId].datasets.push(dataset);
        });
    }

    return (
        <div className={styles.container}>
            <div className={styles.summary}>{t('Summary')}</div>
            {expensesAmountByCurrency &&
                <div className={styles.summaryCard}>
                    <div className={styles.cardAmountContainer}>
                        {Object.values(expensesAmountByCurrency).map(({currency_id, amount, currency_name, currency_symbol}) => (
                            <div key={'amount_' + currency_id} className={styles.cardAmountContainerContent}>
                                <div className={styles.amountText}>{currency_symbol} {amount}</div>
                            </div>
                        ))}
                    </div>
                </div>
            }
            <div className={styles.monthPaymentCardContainer}>
                {data && data.totalAmountByCurrency && Object.keys(data.totalAmountByCurrency).map((currencyId) => (
                    <div className={styles.monthPaymentCard} key={'amoutByCurrency_' + currencyId}>
                        {(() => {
                            const currencyData = data.totalAmountByCurrency[currencyId] || {};
                            const currency = currencyData.currency || {};
                            const symbol = currency.symbol || '';
                            const name = currency.name || '';
                            const paid = data.amountPaidByCurrency[currencyId] || 0;
                            const pending = data.amountPendingByCurrency[currencyId] || 0;
                            const total = currencyData.amount || 0;

                            return (
                                <>
                        <div
                            className={styles.cardTitle}>{t('Month Payments')} {name}</div>
                        <div className={styles.monthPaymentCardDataContainer}>
                            <div className={styles.dashboardChart}>
                                <Doughnut data={chartDataByCurrency[currencyId]}/>
                            </div>
                            <div>
                                <span
                                    className={styles.amount}>{symbol} {paid}</span> {t('of ')}
                                <span
                                    className={styles.amount}>{symbol} {total}</span> {t('paid, pending ')}
                                <span
                                    className={styles.amount}>{symbol} {pending}</span>.
                            </div>
                        </div>
                                </>
                            );
                        })()}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpensesDetails;
