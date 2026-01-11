import "@/styles/globals.css";
import axios from "axios";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  axios.defaults.baseURL = "http://localhost:3000/";
  return <Component {...pageProps} />;
}
