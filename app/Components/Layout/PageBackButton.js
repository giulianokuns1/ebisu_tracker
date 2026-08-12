import { useRouter } from 'next/router';
import styles from './PageBackButton.module.scss';
import { useTranslation } from '@/Hooks/useTranslation';

export default function PageBackButton() {
    const router = useRouter();
    const { t } = useTranslation();
    const goBack = () => window.history.length > 1 ? router.back() : router.push('/dashboard');
    return <button className={styles.button} type="button" onClick={goBack} aria-label={t('Go back')}><i className="bi bi-arrow-left" aria-hidden="true" /></button>;
}
