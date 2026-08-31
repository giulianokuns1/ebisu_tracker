import React from 'react';
import Link from 'next/link';
import Layout from '@/Components/Layout/Layout';
import PublicPageSeo from '@/Components/SEO/PublicPageSeo';
import { WEBSITE_NAME } from '@/constants';
import styles from '@/Components/Download/Download.module.scss';

const APK_URL = '/downloads/ebisu-tracker-1.0.3.apk';

export default function DownloadPage() {
    return <Layout showParticles={false}>
        <PublicPageSeo title={`Download Android App | ${WEBSITE_NAME}`} description="Download and install Ebisu Tracker for Android." path="/download" noIndex />
        <main className={styles.page}>
            <section className={styles.card}>
                <img src="/img/logo3.0-dark-circle.png" alt="Ebisu Tracker" className={styles.logo} />
                <p className={styles.eyebrow}>Ebisu Tracker for Android</p>
                <h1>Take your money plan with you.</h1>
                <p className={styles.description}>Install Ebisu Tracker directly on your Android phone to manage expenses, payments, savings, and annual plans.</p>
                <a href={APK_URL} download className={styles.downloadButton}><i className="bi bi-android2" aria-hidden="true" />Download for Android</a>
                <div className={styles.meta}><span>Version 1.0.3</span><span>2.9 MB</span><span>Android 5.1 or later</span></div>
                <div className={styles.instructions}>
                    <h2>How to install</h2>
                    <ol><li>Download the APK file.</li><li>Open the downloaded file on your Android device.</li><li>Allow installation from your browser or file manager if Android asks.</li><li>Install Ebisu Tracker and sign in.</li></ol>
                </div>
                <p className={styles.notice}><i className="bi bi-shield-check" aria-hidden="true" />This APK is signed and hosted directly by Ebisu Tracker.</p>
                <p className={styles.checksum}>SHA-256: <code>d538ad1ac42e297fb92a3968dbb76af39eed9611ec7f9111b490f67342c6bdfe</code></p>
                <Link href="/" className={styles.back}>Back to website</Link>
            </section>
        </main>
    </Layout>;
}
