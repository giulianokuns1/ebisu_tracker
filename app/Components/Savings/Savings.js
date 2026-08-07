import React from "react";
import { useTranslation } from '@/Hooks/useTranslation';
import { useRouter } from "next/router";
import listStyles from '@/Components/UI/ManagementList.module.scss';

const Savings = ({ savings }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const formatDate = (isoDateString) => {
        const options = {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        };
        const date = new Date(isoDateString);
        return date.toLocaleDateString(undefined, options);
    };
    const handleEditSaving = (savingId) => {
        router.push('/savings/details/' + savingId);
    }
    return (
        <div className={listStyles.surface}>
            {savings.map((saving) => (
                <button type="button" key={saving.id} className={listStyles.row} onClick={() => handleEditSaving(saving.id)}>
                    <span className={listStyles.icon}><i className="bi bi-piggy-bank" aria-hidden="true" /></span>
                    <span><span className={listStyles.primary}>{saving.name}</span><span className={listStyles.meta}>{saving.account_name} · {formatDate(saving.created_at)}</span></span>
                    <span className={listStyles.amount}>{saving.amount}</span>
                    <i className={`bi bi-pencil ${listStyles.edit}`} aria-hidden="true" />
                </button>
            ))}
        </div>
    );
};

export default Savings;
