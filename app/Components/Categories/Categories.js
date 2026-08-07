import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';
import {useRouter} from "next/router";
import listStyles from '@/Components/UI/ManagementList.module.scss';
import styles from './Categories.module.scss';

const Categories = ({ categories }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const handleEditCategory = (categoryId) => {
        router.push('/categories/details/' + categoryId);
    }
    return (
        <div>
            <div className={listStyles.surface}>
                {categories.length ? categories.map((category) => (
                    <button type="button" key={category.id} className={listStyles.row} onClick={() => handleEditCategory(category.id)}><span className={listStyles.icon} style={{ color: category.color || undefined, backgroundColor: category.color ? `${category.color}22` : undefined }}><i className={category.icon} aria-hidden="true" /></span><span className={listStyles.primary}>{category.name}</span><span /><i className={`bi bi-pencil ${listStyles.edit}`} aria-hidden="true" /></button>
                )) : <div className={styles.emptyState}><i className="bi bi-grid" aria-hidden="true" /><strong>{t('No categories yet.')}</strong><span>{t('Add a category to organize your expenses.')}</span></div>}
            </div>
        </div>
    );
};

export default Categories;
