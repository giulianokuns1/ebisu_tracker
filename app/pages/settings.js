import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Settings/Settings.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import LanguageSwitcher from "@/Components/Language/LanguageSwitcher";
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import FormSelect from "@/Components/UI/Form/FormSelect";
import { Toast } from "primereact/toast";
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import { FormShell } from '@/Components/UI/Form/FormLayout';

function SettingsPage() {
    const { t } = useTranslation();
    const [currencies, setCurrencies] = useState([]);
    const [defaultCurrencyId, setDefaultCurrencyId] = useState('');
    const [dashboardShowNextMonth, setDashboardShowNextMonth] = useState(true);
    const notificationToast = React.useRef(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/getSettingsData`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data) {
                    setCurrencies(response.data.currencies || []);
                    setDefaultCurrencyId(response.data.user && response.data.user.default_currency_id ? String(response.data.user.default_currency_id) : '');
                    setDashboardShowNextMonth(response.data.user?.dashboard_show_next_month !== false);
                }
            } catch (error) {
                console.error('Error fetching settings data:', error);
            }
        };

        loadSettings();
    }, []);

    const saveDefaultCurrency = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/updateUserData`,
                {
                    defaultCurrencyId: defaultCurrencyId || null,
                    dashboardShowNextMonth,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.user) {
                const localUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...localUser,
                    default_currency_id: response.data.user.default_currency_id,
                    dashboard_show_next_month: response.data.user.dashboard_show_next_month,
                }));
            }

            notificationToast.current.show({
                severity: 'success',
                summary: t('Success'),
                detail: t('Data saved successfully'),
                life: 3000
            });
        } catch (error) {
            notificationToast.current.show({
                severity: 'error',
                summary: t('Error'),
                detail: t('Error saving the data'),
                life: 3000
            });
        }
    };

    return (
        <LayoutApp>
            <Head>
                <title>{`Settings | ${WEBSITE_NAME}`}</title>
            </Head>
            <Toast ref={notificationToast} position={'top-center'} />
            <AppPageHeader eyebrow="Workspace preferences" title={t('Settings')} description={t('Customize your tracker preferences.')} />
            <FormShell className={styles.settingsCard}><form onSubmit={(event) => { event.preventDefault(); saveDefaultCurrency(); }}>
                <div className={styles.settingBlock}>
                    <label className={styles.settingLabel}>{t('Language')}</label>
                    <LanguageSwitcher mode="select" />
                </div>
                <div className={styles.settingBlock}>
                    <label className={styles.toggleLabel}>
                        <input
                            type="checkbox"
                            checked={dashboardShowNextMonth}
                            onChange={(event) => setDashboardShowNextMonth(event.target.checked)}
                        />
                        <span>{t('Show next month on the dashboard')}</span>
                    </label>
                    <p className={styles.settingHelp}>{t('You can keep the dashboard focused on the current month.')}</p>
                </div>
                <div className={styles.settingBlock}>
                    <FormSelect
                        label={t('Default Currency')}
                        values={currencies}
                        valueLabel={'name'}
                        multipleValueLabel={['name', 'symbol']}
                        value={defaultCurrencyId}
                        onChange={(e) => setDefaultCurrencyId(e.target.value)}
                        defaultLabel={t('Select a Currency')}
                    />
                </div>
                <div className={styles.saveButtonWrapper}>
                    <button className={styles.saveSettings} type="submit"><i className="bi bi-floppy" aria-hidden="true" /> {t('Save Settings')}</button>
                </div>
            </form></FormShell>
        </LayoutApp>
    );
}

export default withAuth(SettingsPage);
