import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useRouter } from 'next/router';
import { API_BASE_URL } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import IconPicker from '@/Components/UI/IconPicker';
import CategoryColorPicker from './CategoryColorPicker';
import { FormActionBar } from '@/Components/UI/Form/FormLayout';
import styles from './Categories.module.scss';

const normalizeIcon = (icon) => (icon || '').replace(/^bi\s+bi-/, '').replace(/^bi-/, '').trim() || 'tag';

export default function CategoriesForm({ categoryId }) {
    const { t } = useTranslation();
    const router = useRouter();
    const [categoryName, setCategoryName] = useState('');
    const [categoryIcon, setCategoryIcon] = useState('tag');
    const [categoryColor, setCategoryColor] = useState('#4FD6BE');
    const [submitted, setSubmitted] = useState(false);
    const isEditing = Boolean(categoryId);
    const validName = categoryName.trim().length > 0;

    useEffect(() => {
        if (!categoryId) return;
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/getCategory?categoryId=${categoryId}`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => {
            const category = response.data?.category;
            if (!category) return;
            setCategoryName(category.name || '');
            setCategoryIcon(normalizeIcon(category.icon));
            setCategoryColor(category.color || '#4FD6BE');
        }).catch((error) => console.error('Error fetching category:', error));
    }, [categoryId]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitted(true);
        if (!validName) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/newCategory`, { id: categoryId || null, name: categoryName.trim(), icon: `bi-${normalizeIcon(categoryIcon)}`, color: categoryColor }, { headers: { Authorization: `Bearer ${token}` } });
            router.push('/categories');
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const deleteCategory = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/deleteCategory`, { id: categoryId }, { headers: { Authorization: `Bearer ${token}` } });
            localStorage.setItem('notification', JSON.stringify({ severity: 'success', summary: t('Success'), detail: t('Category deleted successfully'), life: 3000 }));
            router.push('/categories');
        } catch (error) {
            localStorage.setItem('notification', JSON.stringify({ severity: 'error', summary: t('Error'), detail: t('Error deleting the Category'), life: 3000 }));
            router.push('/categories');
        }
    };

    const requestDelete = () => confirmDialog({ message: <><div>{t('Do you want to delete this category?')}</div><div>{t('All expenses and payments asociated to this category will be deleted too.')}</div></>, header: t('Delete Confirmation'), icon: 'pi pi-info-circle', acceptClassName: 'p-button-danger', accept: deleteCategory });

    return <><ConfirmDialog /><form className={styles.categoryFormCard} onSubmit={handleSubmit}>
        <div className={styles.editorIntro}>
            <div><label className={styles.nameField}>{t('Category Name')} <span aria-hidden="true">*</span><div className={`${styles.nameInputWrap} ${submitted && !validName ? styles.nameInputError : ''}`}><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} aria-invalid={submitted && !validName} autoFocus />{validName && <i className="bi bi-check-circle-fill" aria-hidden="true" />}</div>{submitted && !validName && <small>{t('Please enter a category name.')}</small>}</label><div className={styles.nameColorControl}><CategoryColorPicker color={categoryColor} onChange={setCategoryColor} /></div></div>
            <aside className={styles.previewCard}><p>{t('Preview')}</p><div className={styles.previewContent}><span className={styles.previewIcon} style={{ backgroundColor: `${categoryColor}33`, color: categoryColor }}><i className={`bi bi-${normalizeIcon(categoryIcon)}`} aria-hidden="true" /></span><div><strong>{categoryName || t('Category Name')}</strong><small>{t('This is how it will appear in your categories.')}</small></div></div></aside>
        </div>
        <IconPicker categoryMode onSelect={setCategoryIcon} selectedIcon={categoryIcon} />
        <FormActionBar editing={isEditing} onCancel={() => router.push('/categories')} onDelete={requestDelete} createLabel={t('Create Category')} updateLabel={t('Update Category')} />
    </form></>;
}
