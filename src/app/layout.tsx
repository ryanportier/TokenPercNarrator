import type { Metadata } from "next";
import "@/styles/globals.css";
import Starfield from "@/components/Starfield/Starfield";

export const metadata: Metadata = {
  title: "Token Pulse",
  description: "Live viewer + narrator (paper).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Starfield layer */}
        <div className="starfieldLayer">
          <Starfield />
        </div>

        {/* Aura glow like Obscura */}
        <div className="aura" />

        {/* App content */}
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
