import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import LiquidEther from "@/components/LiquidEther";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Acharya - Intelligent E-Learning",
  description: "Modern E-Learning Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
            <LiquidEther
              colors={['#5227FF', '#FF9FFC', '#B497CF']}
              mouseForce={20}
              cursorSize={100}
              isViscous={false}
              viscous={30}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.5}
              isBounce={false}
              autoDemo={true}
              autoSpeed={0.5}
              autoIntensity={2.2}
              takeoverDuration={0.25}
              autoResumeDelay={3000}
              autoRampDuration={0.6}
            />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
