/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PUBLIC_KEY_HERE: process.env.PUBLIC_KEY_HERE,
    }
}

module.exports = nextConfig

module.exports = {
    output: 'standalone'
}
