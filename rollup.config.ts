import compiler from "@ampproject/rollup-plugin-closure-compiler"
import typescript from "@rollup/plugin-typescript"
import { defineConfig } from "rollup"
import dts from "rollup-plugin-dts"

import pkg from "./package.json"

const config = defineConfig([{
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "esm",
    },
  ],
  plugins: [
    typescript(),
    compiler(),
  ],
},
{
  input: "src/index.ts",
  output: [{ file: pkg.types, format: "esm" }],
  plugins: [dts()],
}])

export default config
