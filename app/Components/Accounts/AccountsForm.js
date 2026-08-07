import React, { useEffect, useState } from 'react';
import styles from './Accounts.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from "next/router";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import FormInput from "@/Components/UI/Form/FormInput";
import FormActionsButton from "@/Components/UI/Form/FormActionsButton";
import FormSelect from "@/Components/UI/Form/FormSelect";

const AccountsForm = ({ accountId }) => {
    const { t } = useTranslation();

    const [accountName, setAccountName] = useState('');
    const [accountAccountNumber, setAccountAccountNumber] = useState('');
    const [nameError, setNameError] = useState('');
    const [accountNumberError, setAccountNumberError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (accountId) {
            axios
                .get(`${API_BASE_URL}/getAccount?accountId=` + accountId, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (response.data && response.data.account) {
                        const account = response.data.account;
                        setAccountName(account.name);
                        setAccountAccountNumber(account.account_number);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching data:', error);
                });
        }
    }, [accountId]);

    const validateName = () => {
        if (!accountName) {
            setNameError(t('Name is required'));
            return false;
        }
        setNameError('');
        return true;
    };
    const validateAccountNumber = () => {
        if (!accountAccountNumber || isNaN(accountAccountNumber) || parseFloat(accountAccountNumber) <= 0) {
            setAccountNumberError(t('AccountNumber must be a number greater than 0'));
            return false;
        }
        setAccountNumberError('');
        return true;
    };

    const router = useRouter();
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        var notificationMessage;
        const isNameValid = validateName();
        const isAccountNumberValid = validateAccountNumber();
        if (isNameValid && isAccountNumberValid) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    `${API_BASE_URL}/newAccount`,
                    {
                        id: accountId || null,
                        name: accountName,
                        accountNumber: accountAccountNumber
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (accountId) {
                    notificationMessage = t('Account updated successfully');
                } else {
                    notificationMessage = t('Account created successfully');
                }
                localStorage.setItem(
                    'notification',
                    JSON.stringify({
                        severity: 'success',
                        summary: t('Success'),
                        detail: notificationMessage,
                        life: 3000
                    })
                );
                router.push('/accounts');
            } catch (error) {
                if (accountId) {
                    notificationMessage = t('Error updating the Account');
                } else {
                    notificationMessage = t('Error creating the Account');
                }
                localStorage.setItem(
                    'notification',
                    JSON.stringify({
                        severity: 'error',
                        summary: t('Error'),
                        detail: notificationMessage,
                        life: 3000
                    })
                );
                router.push('/accounts');
            }
        }
    };
    const deleteAccount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/deleteAccount`,
                {
                    id: accountId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            localStorage.setItem(
                'notification',
                JSON.stringify({
                    severity: 'success',
                    summary: t('Success'),
                    detail: t('Account deleted successfully'),
                    life: 3000
                })
            );
            router.push('/accounts');
        } catch (error) {
            localStorage.setItem(
                'notification',
                JSON.stringify({
                    severity: 'error',
                    summary: t('Error'),
                    detail: t('Error deleting the Account'),
                    life: 3000
                })
            );
            router.push('/accounts');
        }
    }
    const handleDelete = (event, accountId) => {
        event.preventDefault();
        confirmDialog({
            message: t('Do you want to delete this account?'),
            header: t('Delete Confirmation'),
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: deleteAccount
        });
    }
    return (
        <div>
            <ConfirmDialog />
            <form onSubmit={handleFormSubmit}>
                <div className={styles.formWrapper}>
                    <FormInput
                        label={t('Name')}
                        type={'text'}
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        onBlur={validateName}
                        errorMessage={nameError}
                    />
                    <FormInput
                        label={t('Account Number')}
                        type={'number'}
                        value={accountAccountNumber}
                        onChange={(e) => setAccountAccountNumber(e.target.value)}
                        onBlur={validateAccountNumber}
                        errorMessage={accountNumberError}
                    />
                    <div className={styles.formHelperText}>
                        {t('Account number is only a reference. You do not need to use the full account number—just an identifier that helps you recognize this account (e.g. last 4 digits).')}
                    </div>
                </div>
                <FormActionsButton id={accountId} label={t('Account')} type={'submit'} deleteMethod={handleDelete} />
            </form>
        </div>
    );
};

export default AccountsForm;
