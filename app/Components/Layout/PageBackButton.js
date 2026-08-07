import { useRouter } from 'next/router';
import styles from './PageBackButton.module.scss';

export default function PageBackButton() {
    const router = useRouter();
    const goBack = () => window.history.length > 1 ? router.back() : router.push('/dashboard');
    return <button className={styles.button} type="button" onClick={goBack} aria-label="Go back"><i className="bi bi-arrow-left" aria-hidden="true" /></button>;
}
