import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.competooo.app',
    appName: 'Competooo',
    webDir: 'public',
    server: {
        url: 'https://competooo.vercel.app',
        cleartext: true
    },
    plugins: {
        CapacitorCookies: {
            enabled: true,
        },
    },
};

export default config;
