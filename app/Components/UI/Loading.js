import React from 'react';
import styles from './Loading.module.scss';

const Loading = ({ small = false }) => {
    return (
        <div className={`${styles.loadingContainer} ${small ? styles.loadingContainerSmall : ''}`}>
            <div className={`${styles.loadingioSpinner} ${small ? styles.loadingioSpinnerSmall : ''}`}>
                <div className={styles.ldio}>
                    <div></div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
