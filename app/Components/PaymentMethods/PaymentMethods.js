import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import {useRouter} from "next/router";
import listStyles from '@/Components/UI/ManagementList.module.scss';

const PaymentMethods = ({ paymentMethods }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const handleEditCategory = (paymentMethodId) => {
        router.push('/paymentMethods/details/' + paymentMethodId);
    }
    return (
        <div>
            <div className={listStyles.surface}>
                {paymentMethods.map((paymentMethod) => (
                    <button type="button" key={paymentMethod.id} className={listStyles.row} onClick={() => handleEditCategory(paymentMethod.id)}><span className={listStyles.icon}><i className="bi bi-credit-card" aria-hidden="true" /></span><span><span className={listStyles.primary}>{paymentMethod.name}</span><span className={listStyles.meta}>{paymentMethod.is_credit ? t('Credit card') : t('Payment method')}</span></span>{paymentMethod.is_default === 1 && <span className={listStyles.badge}>{t('Default')}</span>}<i className={`bi bi-pencil ${listStyles.edit}`} aria-hidden="true" /></button>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethods;
