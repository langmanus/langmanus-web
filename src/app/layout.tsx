import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import "~/styles/globals.css";

export const metadata: Metadata = {
  title: "🦜🤖 LangManus",
  description:
    "A community-driven AI automation framework that builds upon the incredible work of the open source community.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.2.3/gh-fork-ribbon.min.css"
        />
      </head>
      <body className="bg-body flex min-h-screen min-w-screen">
        <a
          className="github-fork-ribbon"
          href="https://github.com/langmanus/langmanus"
          target="_blank"
          rel="noopener noreferrer"
          data-ribbon="⭐ Star me on GitHub"
          title="Star me on GitHub"
        >
          Star me on GitHub
        </a>
        {children}
      </body>
    </html>
  );
}
