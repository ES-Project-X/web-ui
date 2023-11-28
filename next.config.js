/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PUBLIC_KEY_HERE: process.env.PUBLIC_KEY_HERE,
        DATABASE_API_URL: process.env.DATABASE_API_URL,
        URL_ROUTING: process.env.URL_ROUTING,
        COGNITO_LOGIN_URL: process.env.COGNITO_LOGIN_URL,
    },
    output: "standalone"
}

// Configuration object tells the next-pwa plugin 
const withPWA = require("next-pwa")({
    dest: "public", // Destination directory for the PWA files
    disable: process.env.NODE_ENV === "development", // Disable PWA in development mode
    register: true, // Register the PWA service worker
    skipWaiting: true, // Skip waiting for service worker activation
});

// Export the combined configuration for Next.js with PWA support
module.exports = withPWA(nextConfig);
