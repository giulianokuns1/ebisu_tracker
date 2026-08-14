import styles from './MyAccount.module.scss';
import React, {useEffect, useRef, useState} from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import Logout from '@/Components/Logout/Logout';
import FormInput from "@/Components/UI/Form/FormInput";
import axios from "axios";
import { API_BASE_URL } from "@/constants";
import Button from '@/Components/UI/Button';
import { Toast } from "primereact/toast";

const MyAccount = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState(null);

    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');

    const [firstnameError, setFirstnameError] = useState('');
    const [lastnameError, setLastnameError] = useState('');
    const [emailError, setEmailError] = useState('');

    const notificationToast = useRef(null);


    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData) {
                setUser(userData);
                setFirstname(userData.firstname);
                setLastname(userData.lastname);
                setEmail(userData.email);
            }
        }
    }, []);

    const validateFirstname = () => {
        if (!firstname) {
            setFirstnameError(t('First Name is required'));
            return false;
        }
        setFirstnameError('');
        return true;
    };

    const validateLastname = () => {
        if (!lastname) {
            setLastnameError(t('Last Name is required'));
            return false;
        }
        setLastnameError('');
        return true;
    };

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !email.match(emailRegex)) {
            setEmailError(t('Valid Email is required'));
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        var notificationData;
        const isFirstnameValid = validateFirstname();
        const isLastnameValid = validateLastname();
        const isEmailValid = validateEmail();
        if (isFirstnameValid && isLastnameValid && isEmailValid) {
            try {
                const token = localStorage.getItem('token');
                const updatedUserData = { firstname, lastname, email };
                const response = await axios.post(
                    `${API_BASE_URL}/updateUserData`,
                    updatedUserData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.data.error) {
                    notificationData = {
                        severity: 'error',
                        summary: t('Error'),
                        detail: t(response.data.error),
                        life: 3000
                    }
                } else {
                    localStorage.setItem('user', JSON.stringify(updatedUserData));
                    notificationData = {
                        severity: 'success',
                        summary: t('Success'),
                        detail: t('Data saved successfully'),
                        life: 3000
                    }
                }
            } catch (error) {
                notificationData = {
                    severity: 'error',
                    summary: t('Error'),
                    detail: t('Error saving the data'),
                    life: 3000
                }
                console.error('Error updating user data:', error);
            }
            notificationToast.current.show(notificationData);
        }
    };

    return (
        <div className={styles.container}>
            <Toast ref={notificationToast} position={'top-center'}/>
            <div className={styles.form}>
                <form onSubmit={handleFormSubmit}>
                    <div className={styles.formWrapper}>
                        <FormInput
                            label={t('First Name')}
                            type={'text'}
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            onBlur={validateFirstname}
                            errorMessage={firstnameError}
                        />
                        <FormInput
                            label={t('Last Name')}
                            type={'text'}
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            onBlur={validateLastname}
                            errorMessage={lastnameError}
                        />
                        <FormInput
                            label={t('Email')}
                            type={'email'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={validateEmail}
                            errorMessage={emailError}
                        />
                    </div>
                    <div className={styles.actions}>
                        <Logout />
                        <Button customClass={styles.saveButton} label={t('Save Changes')} type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyAccount;
