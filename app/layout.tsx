
import "./globals.css";
import { Header } from "./header";

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
      <body className="flex flex-col overflow-hidden h-screen">
        <Header />
        <main className="px-2 flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
