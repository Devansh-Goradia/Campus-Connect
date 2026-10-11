import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "CampusConnect ✨ Exclusive Student Matching",
  description: "Anonymous peer networking & mutual identity reveals for verified campus students.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-[#09090b] text-zinc-100 antialiased font-sans min-h-screen relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
        
        {/* Soft, blurred colorful ambient radial gradients in the background */}
        <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none z-0" />
        <div className="fixed top-[30%] right-[-10%] w-[550px] h-[550px] rounded-full bg-purple-600/15 blur-[140px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[130px] pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
