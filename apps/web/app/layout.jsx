import { Archivo } from "next/font/google";

import MotionProvider from "../components/ui/MotionProvider";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata = {
  title: "MotoForge",
  description:
    "Preview compatible motorcycle modifications in 3D and get a quote before you buy parts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="bg-bench font-sans text-graphite antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
