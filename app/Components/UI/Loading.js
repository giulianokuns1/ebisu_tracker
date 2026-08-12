import React from 'react';
import styles from './Loading.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

const Loading = ({ small = false }) => {
    const { t } = useTranslation();
    return (
        <div className={`${styles.loadingContainer} ${small ? styles.loadingContainerSmall : ''}`}>
            <img className={`${styles.logo} ${small ? styles.logoSmall : ''}`} src="/android-chrome-512x512.png" alt="" role="status" aria-label={t('Loading')} />
        </div>
    );
};

export default Loading;
