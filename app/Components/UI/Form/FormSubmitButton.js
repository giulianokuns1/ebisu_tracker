import React, { useState } from 'react';
import styles from "@/Components/UI/Form/Form.module.scss";
import { useTranslation } from '@/Hooks/useTranslation';
import Button from "@/Components/UI/Button";

const FormSubmitButton = ({ label, isUpdate, handleDelete }) => {
    const { t } = useTranslation();

    return (
        <div className={styles.formButtonsContainer}>
            <div className={styles.formSubmitButton}>
                <Button label={(isUpdate ? t('Update ') : t('Create ')) + t(label)} type="submit"/>
            </div>
            <div className={styles.formDeleteButton}>
                {isUpdate &&
                    <Button customClass={styles.deleteButton} label={t('Delete')} onClick={handleDelete}/>
                }
            </div>
        </div>
    );
};

export default FormSubmitButton;
