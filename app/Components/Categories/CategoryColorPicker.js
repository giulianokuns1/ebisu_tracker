import React, { useEffect, useRef, useState } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import styles from './CategoryColorPicker.module.scss';

const presets = ['#4FD6BE', '#55AEED', '#A381F6', '#F2A54F', '#EF6B7A', '#F4CF43', '#41B8B0', '#8FA6B2'];

export default function CategoryColorPicker({ color, onChange }) {
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
        <button className={styles.trigger} type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-haspopup="dialog"><span className={styles.swatch} style={{ backgroundColor: color }} /><span><small>Category color</small><strong>{color.toUpperCase()}</strong></span><i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" /></button>
        {open && <div className={styles.popover} role="dialog" aria-label="Category color picker"><HexColorPicker color={color} onChange={onChange} /><div className={styles.hexField}><span>#</span><HexColorInput color={color} onChange={onChange} prefixed={false} aria-label="Hex color" /></div><div className={styles.presets}>{presets.map((preset) => <button key={preset} className={preset === color.toUpperCase() ? styles.selectedPreset : styles.preset} type="button" onClick={() => onChange(preset)} aria-label={`Use ${preset}`}><span style={{ backgroundColor: preset }} /></button>)}</div></div>}
    </div>;
}
