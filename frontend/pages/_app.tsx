import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import axios from "axios";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  axios.defaults.baseURL = "http://localhost:3000/";
  return (
    <ThemeProvider attribute="class">
      <Component {...pageProps} />
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}
