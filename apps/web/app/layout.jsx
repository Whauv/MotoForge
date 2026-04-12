import "./globals.css";

export const metadata = {
  title: "MotoForge",
  description: "3D Motorcycle Modification Configurator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white antialiased">{children}</body>
    </html>
  );
}
