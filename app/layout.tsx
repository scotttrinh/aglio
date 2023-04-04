import "./globals.css";

export const metadata = {
  title: "Aglio",
  description: "A fragrant focus timer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
