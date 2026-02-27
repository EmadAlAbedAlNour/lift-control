import nextCoreVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  ...nextCoreVitals,
  ...nextTypeScript,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "dist/**"]
  }
];

export default config;
