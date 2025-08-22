import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
const packageJson = require("./package.json");
import postcss from "rollup-plugin-postcss";
import postcssurl from 'postcss-url'
import url from "@rollup/plugin-url";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      del({ targets: 'dist/*' }),
      // url({
      //   include: ["**/*.woff", "**/*.woff2", "**/*.css"],
      //   limit: 0,
      //   // publicPath: "dist/",
      //   emitFiles: true,
      // }),
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      postcss(
        {
          modules: true,
        }
      //   {
      //   // modules: true, // Enables CSS modules
      //   extract: true, // Optional: Extracts CSS to a separate file
      //   // minimize: true, // Optional: Minimize CSS
      //   // plugins: [
      //   //   postcssurl({
      //   //     url: 'copy', // Copies assets to the output folder
      //   //     //basePath: 'assets', // Base path for the assets
      //   //     assetsPath: 'assets', // Directory for assets
      //   //     useHash: true, // Generates a hash for the file names to avoid cache issues
      //   //   }),
      //   // ],
      // }
      ),
      terser({
        keep_fnames: true,
      }),
      copy({
      targets: [
        { src: 'src/PinsAndCurvesStylesheet.css', dest: 'dist/' },
      ]
    })
    ],
    // external: ["react", "react-dom"],
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/types/types.d.ts", format: "es" }],
    plugins: [
      // url({
      //   include: ["**/*.woff", "**/*.woff2", "**/*.css"],
      //   limit: Infinity,
      //   // publicPath: "dist/",
      //   // emitFiles: true,
      // }),
      dts.default()],
      external: [/\.(css|less|scss)$/],
  },
];