import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './DateRangeFilter.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

const formatDate = (date) => date ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';

export default function DateRangeFilter({ value, onChange, onClear }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(value);
    useEffect(() => setDraft(value), [value]);
    const applyPreset = (start, end) => { setDraft([start, end]); onChange([start, end]); setOpen(false); };
    const selectRange = (dates) => {
        setDraft(dates);
        if (dates[0] && dates[1]) { onChange(dates); setOpen(false); }
    };
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);
    const lastThirty = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
    return <div className={styles.container}>
        <button type="button" className={styles.trigger} onClick={() => setOpen((visible) => !visible)} aria-expanded={open} aria-haspopup="dialog"><i className="bi bi-calendar3" aria-hidden="true" /><span>{formatDate(value[0])} - {formatDate(value[1])}</span><i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" /></button>
        {open && <div className={styles.popover} role="dialog" aria-label={t('Date range filter')}><div className={styles.presets}><button type="button" onClick={() => applyPreset(thisMonth, today)}>{t('This Month')}</button><button type="button" onClick={() => applyPreset(lastThirty, today)}>{t('Last 30 Days')}</button><button type="button" onClick={() => applyPreset(thisYear, today)}>{t('This Year')}</button></div><DatePicker inline selectsRange startDate={draft[0]} endDate={draft[1]} onChange={selectRange} /><div className={styles.footer}><span>{draft[0] && !draft[1] ? t('Select an end date') : t('Range applied automatically')}</span><button type="button" onClick={() => { setDraft([null, null]); onClear(); setOpen(false); }}>{t('Clear')}</button></div></div>}
    </div>;
}
