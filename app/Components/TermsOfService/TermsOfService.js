import React from 'react';
import { WEBSITE_NAME } from '@/constants';
import styles from './TermsOfService.module.scss';

const TermsOfService = () => {
    return (
        <div className={styles.container}>
            <h1>Terms of Service</h1>
            <p className={styles.updated}>Last updated: May 30, 2026</p>

            <section>
                <h2>Acceptance of Terms</h2>
                <p>
                    By accessing or using {WEBSITE_NAME}, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.
                </p>
            </section>

            <section>
                <h2>Account Responsibilities</h2>
                <ul>
                    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                    <li>You are responsible for all activities performed under your account.</li>
                    <li>You agree to provide accurate information and keep your account details updated.</li>
                </ul>
            </section>

            <section>
                <h2>Permitted Use</h2>
                <p>
                    You may use the service only for lawful personal or internal business expense tracking. You agree not to misuse the platform,
                    attempt unauthorized access, or interfere with service operations.
                </p>
            </section>

            <section>
                <h2>Service Availability</h2>
                <p>
                    We work to keep the service available and reliable, but we do not guarantee uninterrupted availability. Features may change,
                    be updated, or be discontinued at any time.
                </p>
            </section>

            <section>
                <h2>Data and Backups</h2>
                <p>
                    You own the data you create in the platform. While we apply reasonable safeguards, you are encouraged to keep your own backups
                    of critical financial records.
                </p>
            </section>

            <section>
                <h2>Disclaimer</h2>
                <p>
                    The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. Nothing in the platform constitutes legal, tax,
                    or financial advice.
                </p>
            </section>

            <section>
                <h2>Limitation of Liability</h2>
                <p>
                    To the maximum extent permitted by law, {WEBSITE_NAME} will not be liable for indirect, incidental, or consequential damages
                    resulting from your use of the service.
                </p>
            </section>

            <section>
                <h2>Termination</h2>
                <p>
                    We may suspend or terminate access for violations of these terms or for security reasons. You may stop using the service at any time.
                </p>
            </section>

            <section>
                <h2>Changes to Terms</h2>
                <p>
                    We may revise these Terms of Service from time to time. Continued use after updates means you accept the revised terms.
                </p>
            </section>

            <section>
                <h2>Contact</h2>
                <p>
                    Questions about these Terms of Service can be sent to <a href="mailto:ebisutracker@gmail.com">ebisutracker@gmail.com</a>.
                </p>
            </section>
        </div>
    );
};

export default TermsOfService;
