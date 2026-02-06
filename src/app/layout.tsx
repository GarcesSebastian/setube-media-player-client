import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";

const discordFont = localFont({
  src: "../../public/fonts/Discord.ttf",
  variable: "--font-discord",
});

export const metadata: Metadata = {
  title: "Setube",
  description: "This is a media player converter for youtube videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${discordFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
