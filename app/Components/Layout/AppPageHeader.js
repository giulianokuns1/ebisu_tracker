import Link from 'next/link';
import PageBackButton from './PageBackButton';
import styles from './AppPageHeader.module.scss';

export default function AppPageHeader({ eyebrow = 'Money tracker', title, description, actionHref, actionLabel, secondaryAction, showBack = true }) {
    return (
        <header className={styles.header}>
            <div>
                {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
                <div className={styles.title}>{showBack && <PageBackButton />}<h1>{title}</h1></div>
                {description && <p>{description}</p>}
            </div>
            <div className={styles.actions}>{secondaryAction}{actionHref && <Link href={actionHref} className={styles.action}><i className="bi bi-plus-lg" aria-hidden="true" /> {actionLabel}</Link>}</div>
        </header>
    );
}
