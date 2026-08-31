import { useEffect, useState } from 'react';
import styles from './AppUpdate.module.scss';

const manifestUrl = '/app-version.json';

export default function AppUpdate() {
    const [update, setUpdate] = useState(null);
    const [error, setError] = useState('');
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
        const checkForUpdate = async () => {
            const plugin = window.Capacitor?.Plugins?.AppUpdate;
            if (!plugin) return;

            try {
                const [installed, response] = await Promise.all([plugin.getVersion(), fetch(manifestUrl, { cache: 'no-store' })]);
                if (!response.ok) return;
                const manifest = await response.json();
                const android = manifest.android;
                if (android && Number(android.versionCode) > Number(installed.versionCode)) setUpdate(android);
            } catch (requestError) {
                console.warn('Unable to check for an Android app update.', requestError);
            }
        };

        checkForUpdate();
    }, []);

    const install = async () => {
        const plugin = window.Capacitor?.Plugins?.AppUpdate;
        if (!plugin || !update) return;
        setError('');
        setIsInstalling(true);
        try {
            await plugin.install({ url: update.apkUrl });
        } catch (installError) {
            setError(installError?.message || 'Unable to start the update.');
        } finally {
            setIsInstalling(false);
        }
    };

    if (!update) return null;

    return <div className={styles.backdrop} role="presentation">
        <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="app-update-title">
            <span className={styles.icon}><i className="bi bi-arrow-down-circle" aria-hidden="true" /></span>
            <p className={styles.eyebrow}>Ebisu Tracker update</p>
            <h2 id="app-update-title">Version {update.versionName} is ready</h2>
            <p>{update.releaseNotes}</p>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.actions}>
                {!update.required && <button type="button" onClick={() => setUpdate(null)}>Later</button>}
                <button type="button" onClick={install} disabled={isInstalling}>{isInstalling ? 'Starting update...' : 'Update now'}</button>
            </div>
        </section>
    </div>;
}
