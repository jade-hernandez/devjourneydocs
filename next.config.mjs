import nextra from "nextra";
import { remarkCodeHike, recmaCodeHike } from "codehike/mdx";

/** @type {import('codehike/mdx').CodeHikeConfig} */
const chConfig = {
  components: {
    code: "MyCode",
    inlineCode: "MyInlineCode"
  }
};

// const withMDX = nextMDX({
//   extension: /\.mdx?$/,
//   options: {
//     remarkPlugins: [[remarkCodeHike, chConfig], remarkGfm],
//     recmaPlugins: [[recmaCodeHike, chConfig]],
//     rehypePlugins: [rehypePrism],
//     jsx: true
//   }
// });

const mdxOptions = {
  remarkPlugins: [[remarkCodeHike, chConfig]],
  recmaPlugins: [[recmaCodeHike, chConfig]]
};

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx"
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withNextra(nextConfig, mdxOptions);
// import remarkGfm from "remark-gfm";
// import rehypePrism from "@mapbox/rehype-prism";
// import { remarkCodeHike, recmaCodeHike } from "codehike/mdx";
// import nextMDX from "@next/mdx";
// import nextra from "nextra";

// const withNextra = nextra({
//   theme: "nextra-theme-docs",
//   themeConfig: "./theme.config.tsx"
// });

// /** @type {import('codehike/mdx').CodeHikeConfig} */
// const chConfig = {
//   components: {
//     code: "MyCode",
//     inlineCode: "MyInlineCode"
//   },
//   syntaxHighlighting: {
//     theme: "github-dark"
//   }
// };

// const withMDX = nextMDX({
//   extension: /\.mdx?$/,
//   options: {
//     remarkPlugins: [[remarkCodeHike, chConfig], remarkGfm],
//     recmaPlugins: [[recmaCodeHike, chConfig]],
//     rehypePlugins: [rehypePrism],
//     jsx: true
//   }
// });

// const nextConfig = {
//   pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
//   experimental: { esmExternals: true }
// };

// export default withNextra(withMDX(nextConfig));
