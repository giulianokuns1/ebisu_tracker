import '../styles/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "primereact/resources/themes/soho-dark/theme.css";
import "primereact/resources/primereact.min.css";
import { Inter } from 'next/font/google';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PrimeReactProvider } from 'primereact/api';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '@/constants';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function App({ Component, pageProps }) {
    return (
        <div className={inter.className}>
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
