import React, { useState } from 'react';
import styles from "@/Components/UI/Form/Form.module.scss";
import { useTranslation } from '@/Hooks/useTranslation';
import Button from "@/Components/UI/Button";

const FormActionsButton = ({ id, label, type, deleteMethod }) => {
    const { t } = useTranslation();

    return (
        <div className={styles.formButtonsContainer}>
            <div className={styles.formSubmitButton}>
                <Button label={(id ? t('Update') : t('Create')) + label} type={type} />
            </div>
            <div className={styles.formDeleteButton}>
                {id &&
                    <Button customClass={styles.deleteButton} label={t('Delete')} onClick={deleteMethod} />
                }
            </div>
        </div>
    );
};

export default FormActionsButton;
