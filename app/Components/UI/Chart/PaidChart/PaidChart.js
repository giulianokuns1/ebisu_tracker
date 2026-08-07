import React from 'react';
import styles from './PaidChart.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

const Dashboard = ({ data }) => {
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
                    '#047a6c',
                    '#233130',
                ],
                borderColor: [
                    '#047a6c',
                    '#233130',
                ],
                borderWidth: 1,
            };

            chartDataByCurrency[currencyId].datasets.push(dataset);
        });
    }
    return (
        <div>
            <div className={styles.monthPaymentCardContainer}>
                {data && data.totalAmountByCurrency && Object.keys(data.totalAmountByCurrency).map((currencyId) => (
                    <div className={styles.monthPaymentCard} key={currencyId}>
                        <div className={styles.cardTitle}>{t('Month Payments')} {(data.totalAmountByCurrency[currencyId].currency && data.totalAmountByCurrency[currencyId].currency.name) || ''}</div>
                        <div className={styles.monthPaymentCardDataContainer}>
                            <div className={styles.dashboardChart}>
                                <Doughnut data={chartDataByCurrency[currencyId]} />
                            </div>
                            <div className={styles.monthPaymentCardDataTextContainer}>
                                <span className={styles.amount}>{(data.totalAmountByCurrency[currencyId].currency && data.totalAmountByCurrency[currencyId].currency.symbol) || ''} {data.amountPaidByCurrency[currencyId] || 0}</span> {t('of')} <span className={styles.amount}>{(data.totalAmountByCurrency[currencyId].currency && data.totalAmountByCurrency[currencyId].currency.symbol) || ''} {data.totalAmountByCurrency[currencyId].amount || 0}</span> {t('paid this month, pending')} <span className={styles.amount}>{(data.totalAmountByCurrency[currencyId].currency && data.totalAmountByCurrency[currencyId].currency.symbol) || ''} {data.amountPendingByCurrency[currencyId] || 0}</span>.
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
