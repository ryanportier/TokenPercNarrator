import type { Metadata } from "next";
import "@/styles/globals.css";
import Starfield from "@/components/Starfield/Starfield";

export const metadata: Metadata = {
  title: "PERCS Operator",
  description: "Percolator read-only dashboard + Pulse terminal (paper mode).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="starfieldLayer">
          <Starfield />
        </div>

        <div className="aura" />

        <div className="container">{children}</div>
      </body>
    </html>
  );
}
