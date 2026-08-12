import React, { useMemo, useState } from 'react';
import icons from '@/public/icons.json';
import styles from './IconPicker.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

const tabs = [
    { id: 'all', label: 'All Icons', icon: 'bi-grid' },
    { id: 'popular', label: 'Popular', icon: 'bi-star' },
    { id: 'finance', label: 'Finance', icon: 'bi-currency-dollar', terms: ['cash', 'bank', 'wallet', 'coin', 'credit-card', 'piggy', 'graph', 'bar-chart', 'pie-chart', 'receipt'] },
    { id: 'home', label: 'Home', icon: 'bi-house', terms: ['house', 'home', 'building', 'lamp', 'door', 'key', 'flower', 'droplet'] },
    { id: 'lifestyle', label: 'Lifestyle', icon: 'bi-heart', terms: ['heart', 'camera', 'music', 'gamepad', 'book', 'balloon', 'sun', 'moon', 'gift', 'palette'] },
    { id: 'transport', label: 'Transport', icon: 'bi-car-front', terms: ['car', 'bus', 'train', 'airplane', 'bicycle', 'scooter', 'fuel', 'ship', 'map', 'geo'] },
    { id: 'shopping', label: 'Shopping', icon: 'bi-bag', terms: ['cart', 'bag', 'basket', 'box', 'shop', 'store'] },
    { id: 'more', label: 'More', icon: 'bi-three-dots' },
];
const popular = ['house', 'building', 'bank', 'wallet2', 'currency-dollar', 'piggy-bank', 'bar-chart-line', 'pie-chart', 'cart', 'bag', 'gift', 'tag', 'basket', 'cup-hot', 'heart', 'car-front', 'airplane', 'train-front', 'fuel-pump', 'bicycle', 'camera', 'book', 'controller', 'phone', 'laptop', 'sun', 'cloud', 'umbrella', 'lightning'];

export default function IconPicker({ onSelect, selectedIcon, categoryMode = false }) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [tab, setTab] = useState('all');
    const normalizeIcon = (icon) => (icon || '').replace(/^bi\s+bi-/, '').replace(/^bi-/, '').trim();
    const normalizedSelectedIcon = normalizeIcon(selectedIcon);
    const iconsArray = Object.values(icons);
    const displayedIcons = useMemo(() => {
        const activeTab = tabs.find((item) => item.id === tab);
        const matchesTab = (icon) => {
            if (tab === 'all') return true;
            if (tab === 'popular') return popular.includes(icon);
            if (tab === 'more') return !tabs.filter((item) => item.terms).some((item) => item.terms.some((term) => icon.includes(term)));
            return activeTab.terms.some((term) => icon.includes(term));
        };
        return iconsArray.filter((icon) => matchesTab(icon) && icon.includes(searchQuery.toLowerCase()));
    }, [iconsArray, searchQuery, tab]);

    if (!categoryMode) return <div className={styles.legacyPicker}>
        <label className={styles.searchLabel} htmlFor="icon-search">{t('Search icons')}</label>
        <div className={styles.searchWrap}><i className="bi bi-search" aria-hidden="true" /><input id="icon-search" className={styles.search} type="search" placeholder={t('Search icons')} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div>
        <div className={styles.legacyGrid}>{iconsArray.filter((icon) => icon.includes(searchQuery.toLowerCase())).map((icon) => <button key={icon} type="button" className={normalizedSelectedIcon === icon ? styles.legacySelected : styles.legacyIcon} onClick={() => onSelect(icon)} aria-label={`${t('Select')} ${icon.replaceAll('-', ' ')}`}><i className={`bi bi-${icon}`} aria-hidden="true" /></button>)}</div>
    </div>;

    return <section className={styles.picker} aria-label={t('Choose an icon')}>
        <label className={styles.searchLabel} htmlFor="category-icon-search">{t('Choose Icon')} <span aria-hidden="true">*</span></label>
        <div className={styles.searchWrap}><i className="bi bi-search" aria-hidden="true" /><input id="category-icon-search" className={styles.search} type="search" placeholder={t('Search icons...')} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /></div>
        <div className={styles.browser}>
            <div className={styles.tabs} role="tablist" aria-label={t('Icon groups')}>{tabs.map((item) => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? styles.tabActive : styles.tab} onClick={() => setTab(item.id)}><i className={`bi ${item.icon}`} aria-hidden="true" />{t(item.label)}</button>)}</div>
            <div className={styles.iconGrid}>{displayedIcons.map((icon) => <button key={icon} type="button" className={normalizedSelectedIcon === icon ? styles.iconSelected : styles.iconButton} onClick={() => onSelect(icon)} aria-label={`${t('Select')} ${icon.replaceAll('-', ' ')}`} aria-pressed={normalizedSelectedIcon === icon}><i className={`bi bi-${icon}`} aria-hidden="true" />{normalizedSelectedIcon === icon && <span className={styles.selectedMark}><i className="bi bi-check" aria-hidden="true" /></span>}</button>)}{!displayedIcons.length && <p className={styles.empty}>{t('No icons match your search.')}</p>}</div>
        </div>
    </section>;
}
