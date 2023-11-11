/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PUBLIC_KEY_HERE: process.env.PUBLIC_KEY_HERE,
        DATABASE_API_URL: process.env.DATABASE_API_URL,
        URL_ROUTING: process.env.URL_ROUTING,
    }
}

module.exports = nextConfig
