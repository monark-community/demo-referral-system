import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // components/ui is installed from the @monark/ui registry and kept identical to it;
  // fixes go upstream, so the React Compiler advisory rule is relaxed there.
  {
    files: ["src/components/ui/**"],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".cand/**"]),
]);

export default eslintConfig;
