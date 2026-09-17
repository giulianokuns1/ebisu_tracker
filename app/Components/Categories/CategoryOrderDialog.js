import { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import useModalBackButton from '@/Hooks/useModalBackButton';
import styles from './CategoryOrderDialog.module.scss';

export default function CategoryOrderDialog({ visible, onHide, onSaved }) {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const close = useModalBackButton(visible, onHide);

    useEffect(() => {
        if (!visible) return;
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/getCategories`, { headers: { Authorization: `Bearer ${token}` } }).then((response) => setCategories(response.data.categories || []));
    }, [visible]);

    const move = (index, direction) => setCategories((current) => {
        const target = index + direction;
        if (target < 0 || target >= current.length) return current;
        const next = [...current];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
    });
    const save = async () => {
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/updateCategoryOrder`, { categoryIds: categories.map((category) => category.id) }, { headers: { Authorization: `Bearer ${token}` } });
        close();
        onSaved?.();
    };

    return <Dialog header={t('Category order')} visible={visible} onHide={close} className={styles.dialog} style={{ width: '390px' }} breakpoints={{ '600px': 'calc(100vw - 24px)' }}><p className={styles.intro}>{t('Choose the category order used across your expense views.')}</p><div className={styles.list}>{categories.map((category, index) => <div className={styles.row} key={category.id}><span className={styles.dot} style={{ backgroundColor: category.color || '#809297' }} /><strong>{category.name}</strong><div><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={t('Move up')}><i className="bi bi-chevron-up" /></button><button type="button" onClick={() => move(index, 1)} disabled={index === categories.length - 1} aria-label={t('Move down')}><i className="bi bi-chevron-down" /></button></div></div>)}</div><div className={styles.actions}><button type="button" onClick={() => setCategories((current) => [...current].sort((a, b) => a.name.localeCompare(b.name)))}>{t('Alphabetical')}</button><button type="button" className={styles.save} onClick={save}>{t('Save order')}</button></div></Dialog>;
}
