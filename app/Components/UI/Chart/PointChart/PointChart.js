import React from 'react';
import styles from './PointChart.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

const PointChart = ({ data, labels, mainLabel, subLabel }) => {
    const { t } = useTranslation();
    ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: t(subLabel),
                data: data,
                backgroundColor: '#51E0CF',
                borderColor: '#51E0CF',
                borderWidth: 1,
                fill: false,
                tension: 0.1,
                showLine: true,
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: t(mainLabel),
            },
        },
    };

    return (
        <div className={styles.container}>
            <div>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default PointChart;
