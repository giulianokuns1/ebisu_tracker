import React from 'react';
import styles from './FormLayout.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

export const FormSection = ({ icon, title, optional = false, children }) => {
    const { t } = useTranslation();
    return <section className={styles.section}><header><span><i className={`bi ${icon}`} aria-hidden="true" /></span><h2>{title}{optional && <small>{t('Optional')}</small>}</h2></header><div className={styles.sectionBody}>{children}</div></section>;
};

export const FormActionBar = ({ editing = false, onCancel, onDelete, createLabel, updateLabel }) => {
    const { t } = useTranslation();
    return <footer className={styles.actions}>{editing && <button className={styles.delete} type="button" onClick={onDelete}><i className="bi bi-trash3" aria-hidden="true" /> {t('Delete')}</button>}<div className={styles.rightActions}><button className={styles.cancel} type="button" onClick={onCancel}>{t('Cancel')}</button><button className={styles.primary} type="submit"><i className={`bi ${editing ? 'bi-check2-circle' : 'bi-plus-circle'}`} aria-hidden="true" /> {editing ? updateLabel : createLabel}</button></div></footer>;
};

export const FormShell = ({ children, className = '' }) => <div className={`${styles.shell} ${className}`}>{children}</div>;
