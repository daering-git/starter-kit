import nextConfig from "eslint-config-next/core-web-vitals";
import nextTypescriptConfig from "eslint-config-next/typescript";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  // Ignore auto-generated shadcn/ui component files
  {
    ignores: ["src/components/ui/**"],
  },
  ...nextConfig,
  ...nextTypescriptConfig,
  {
    rules: {
      // The set-state-in-effect rule is too strict for common SSR hydration patterns
      // (e.g., setMounted(true) in useEffect for preventing hydration mismatches)
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
