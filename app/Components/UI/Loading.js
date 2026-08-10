import React from 'react';
import styles from './Loading.module.scss';

const Loading = ({ small = false }) => {
    return (
        <div className={`${styles.loadingContainer} ${small ? styles.loadingContainerSmall : ''}`}>
            <img className={`${styles.logo} ${small ? styles.logoSmall : ''}`} src="/android-chrome-512x512.png" alt="" role="status" aria-label="Loading" />
        </div>
    );
};

export default Loading;
