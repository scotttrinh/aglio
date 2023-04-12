
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
      <body className="flex flex-col overflow-hidden h-screen text-gray-200">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
