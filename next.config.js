/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PUBLIC_KEY_HERE: process.env.PUBLIC_KEY_HERE,
        DATABASE_API_URL: process.env.DATABASE_API_URL,
        URL_ROUTING: process.env.URL_ROUTING,
        COGNITO_LOGIN_URL: process.env.COGNITO_LOGIN_URL,
    }
}

module.exports = nextConfig