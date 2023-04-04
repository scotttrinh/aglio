
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
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
