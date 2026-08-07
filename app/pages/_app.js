import '../styles/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "primereact/resources/themes/soho-dark/theme.css";
import "primereact/resources/primereact.min.css";
import { Inter } from 'next/font/google';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PrimeReactProvider } from 'primereact/api';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID, RECAPTCHA_ENABLED, RECAPTCHA_SITE_KEY } from '@/constants';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function App({ Component, pageProps }) {
    return (
        <div className={inter.className}>
            {RECAPTCHA_ENABLED && RECAPTCHA_SITE_KEY && (
                <Script
                    src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
                    strategy="afterInteractive"
                />
            )}
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <PrimeReactProvider>
                        <Component {...pageProps} />
                    </PrimeReactProvider>
                </LocalizationProvider>
            </GoogleOAuthProvider>
        </div>
    );
}
