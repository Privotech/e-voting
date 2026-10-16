import type { AppProps } from 'next/app';
import { ThemeProvider } from "./Context/ThemeContext";
import { Toaster } from "react-hot-toast";

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            fontSize: "0.875rem",
            fontWeight: "600",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default App;
