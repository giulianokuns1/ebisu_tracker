import React, {useRef} from "react";
import { useTranslation } from '@/Hooks/useTranslation';
import { useRouter } from "next/router";
import listStyles from '@/Components/UI/ManagementList.module.scss';

const Accounts = ({ accounts }) => {
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
    const handleEditPayment = (accountId) => {
        router.push('/accounts/details/' + accountId);
    }
    return (
        <div>
            <div className={listStyles.surface}>
                {accounts.map((account) => (
                    <button type="button" key={account.id} className={listStyles.row} onClick={() => handleEditPayment(account.id)}><span className={listStyles.icon}><i className="bi bi-bank" aria-hidden="true" /></span><span><span className={listStyles.primary}>{account.name}</span><span className={listStyles.meta}>{account.account_number || '—'}</span></span><span /><i className={`bi bi-pencil ${listStyles.edit}`} aria-hidden="true" /></button>
                ))}
            </div>
        </div>
    );
};

export default Accounts;
