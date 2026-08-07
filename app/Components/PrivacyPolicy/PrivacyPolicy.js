import React from 'react';
import { WEBSITE_NAME } from '@/constants';
import styles from './PrivacyPolicy.module.scss';

const PrivacyPolicy = () => {
    return (
        <div className={styles.container}>
            <h1>Privacy Policy</h1>
            <p className={styles.updated}>Last updated: May 30, 2026</p>

            <section>
                <h2>Overview</h2>
                <p>
                    This Privacy Policy explains how {WEBSITE_NAME} collects, uses, and protects your information when you use our website and app.
                    By creating an account or using the service, you agree to the practices described in this policy.
                </p>
            </section>

            <section>
                <h2>Information We Collect</h2>
                <ul>
                    <li>Account details you provide, such as first name, last name, email, and encrypted password.</li>
                    <li>Financial tracking data you create, including categories, expenses, payments, budgets, and settings.</li>
                    <li>Technical information such as IP address, browser type, and session/cookie identifiers needed for security and authentication.</li>
                    <li>Security verification signals from third-party anti-abuse tools (for example, Google reCAPTCHA).</li>
                </ul>
            </section>

            <section>
                <h2>How We Use Information</h2>
                <ul>
                    <li>To provide core features of the app and maintain your account.</li>
                    <li>To secure logins, detect abuse, and prevent unauthorized access.</li>
                    <li>To improve app stability, performance, and user experience.</li>
                    <li>To respond to support requests and communicate important service updates.</li>
                </ul>
            </section>

            <section>
                <h2>Cookies and Sessions</h2>
                <p>
                    We use cookies and session technologies to keep you signed in and to protect your account. You can manage cookies in your browser settings,
                    but disabling required cookies may affect application functionality.
                </p>
            </section>

            <section>
                <h2>Third-Party Services</h2>
                <p>
                    We may use trusted third-party services for authentication and security features, including Google Sign-In and Google reCAPTCHA.
                    These services may process technical data according to their own privacy terms.
                </p>
            </section>

            <section>
                <h2>Data Retention and Deletion</h2>
                <p>
                    We retain your information while your account is active or as needed to provide the service. You may request account deletion by contacting us,
                    and we will remove or anonymize data unless we are required to keep it for legal or security reasons.
                </p>
            </section>

            <section>
                <h2>Your Rights</h2>
                <p>
                    Depending on your jurisdiction, you may have rights to access, correct, export, or delete your personal data. To exercise your rights,
                    contact us using the details below.
                </p>
            </section>

            <section>
                <h2>Contact</h2>
                <p>
                    If you have questions about this Privacy Policy, contact us at{' '}
                    <a href="mailto:ebisutracker@gmail.com">ebisutracker@gmail.com</a>.
                </p>
            </section>

            <section>
                <h2>Policy Updates</h2>
                <p>
                    We may update this Privacy Policy from time to time. Any material changes will be reflected by updating the date above.
                </p>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
