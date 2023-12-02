import './globals.css'
import "bootstrap/dist/css/bootstrap.min.css";
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'

const inter = Inter({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Project-X',
    description: 'Community collaboration platform for bicycle users',
    generator: "Next.js",
    manifest: "/manifest.json",
    keywords: ["nextjs", "nextjs13", "next13", "pwa", "next-pwa", "project-x"],
    themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#fff" }],
    authors: [
      { name: "Diogo Paiva",
        url: "https://github.com/DiogoPaiva21"
      },
      { name: "Gonçalo Silva",
        url: "https://github.com/GoncaloSilva25"
      },
      { name: "Guilherme Antunes",
        url: "https://github.com/SysteM1922"
      },
      { name: "João Fonseca",
        url: "https://github.com/joaompfonseca"
      },
      { name: "Pedro Rasinhas",
        url: "https://github.com/r4sinhas"
      },
    ],
    viewport:
      "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
    icons: [
      { rel: "apple-touch-icon", url: "icons/icon-128x128.png" },
      { rel: "icon", url: "icons/icon-128x128.png" },
    ],
  };

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>{children}</body>
        </html>
    )
}
