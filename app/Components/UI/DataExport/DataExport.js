import { useTranslation } from '@/Hooks/useTranslation';
import styles from './DataExport.module.scss';

const csvValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export default function DataExport({ columns, filename, rows, disabled = false }) {
    const { t } = useTranslation();
    const download = () => {
        const csv = [
            columns.map((column) => csvValue(column.label)).join(','),
            ...rows.map((row) => columns.map((column) => csvValue(typeof column.value === 'function' ? column.value(row) : row[column.value])).join(',')),
        ].join('\r\n');
        const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    return <button type="button" className={styles.button} onClick={download} disabled={disabled || !rows.length}><i className="bi bi-filetype-csv" aria-hidden="true" />{t('Export CSV')}</button>;
}
