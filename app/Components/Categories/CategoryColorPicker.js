import React, { useEffect, useRef, useState } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import styles from './CategoryColorPicker.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

const presets = [
    ['#4FD6BE', '#55AEED', '#A381F6', '#F2A54F', '#EF6B7A', '#F4CF43', '#41B8B0', '#8FA6B2'],
    ['#168782', '#287CB8', '#7052B8', '#C8752B', '#C94D62', '#C99D24', '#287E78', '#5C727C'],
    ['#A7EEE1', '#A7D9F5', '#CDBCFB', '#F9C486', '#F6AAB5', '#F9E28B', '#9BDED8', '#C4D0D5'],
];

export default function CategoryColorPicker({ color, onChange }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const closeOnOutsideClick = (event) => { if (!containerRef.current?.contains(event.target)) setOpen(false); };
        const closeOnEscape = (event) => { if (event.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => { document.removeEventListener('mousedown', closeOnOutsideClick); document.removeEventListener('keydown', closeOnEscape); };
    }, []);

    return <div className={styles.picker} ref={containerRef}>
        <button className={styles.trigger} type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-haspopup="dialog"><span className={styles.swatch} style={{ backgroundColor: color }} /><span><small>{t('Category color')}</small><strong>{color.toUpperCase()}</strong></span><i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" /></button>
        {open && <div className={styles.popover} role="dialog" aria-label={t('Category color picker')}><HexColorPicker color={color} onChange={onChange} /><div className={styles.hexField}><span>#</span><HexColorInput color={color} onChange={onChange} prefixed={false} aria-label={t('Hex color')} /></div><div className={styles.presets}>{presets.map((tone, index) => <div className={styles.presetRow} key={index}>{tone.map((preset) => <button key={preset} className={preset === color.toUpperCase() ? styles.selectedPreset : styles.preset} type="button" onClick={() => onChange(preset)} aria-label={`${t('Use')} ${preset}`}><span style={{ backgroundColor: preset }} /></button>)}</div>)}</div></div>}
    </div>;
}
