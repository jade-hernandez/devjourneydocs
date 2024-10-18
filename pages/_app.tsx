// import { MyCode, MyInlineCode } from "../components/CustomCodeComponents";
import type { AppProps } from "next/app";

import "./global.css";
// import "codehike/styles.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Component
      {...pageProps}
      style={{ margin: "0 auto", maxWidth: "800px", background: "red" }}
      // components={{
      //   MyCode,
      //   MyInlineCode
      // }}
    />
  );
}
