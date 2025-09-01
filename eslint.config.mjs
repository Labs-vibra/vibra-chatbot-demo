import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Desabilitar todas as regras do ESLint
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "react/jsx-key": "off",
      "react/no-children-prop": "off",
      "react/jsx-no-target-blank": "off",
      "react/no-unknown-property": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      "prefer-const": "off",
      "no-unused-vars": "off",
      "no-console": "off",
      "no-debugger": "off",
      "no-var": "off",
      "no-undef": "off",
      "no-extra-semi": "off",
      "no-unreachable": "off",
      "no-empty": "off",
      "no-constant-condition": "off",
      "no-irregular-whitespace": "off",
      "no-unexpected-multiline": "off",
      "no-sparse-arrays": "off",
      "no-prototype-builtins": "off",
      "no-case-declarations": "off",
      "no-fallthrough": "off",
      "no-useless-escape": "off",
      "no-inner-declarations": "off",
      "no-redeclare": "off",
      "no-self-assign": "off",
      "no-mixed-spaces-and-tabs": "off",
      "no-unsafe-negation": "off",
      "no-global-assign": "off",
      "no-delete-var": "off",
      "no-func-assign": "off",
      "no-import-assign": "off",
      "no-new-symbol": "off",
      "no-obj-calls": "off",
      "no-octal": "off",
      "no-regex-spaces": "off",
      "no-setter-return": "off",
      "no-shadow-restricted-names": "off",
      "no-unsafe-finally": "off",
      "no-unsafe-optional-chaining": "off",
      "no-unused-labels": "off",
      "no-useless-catch": "off",
      "no-with": "off",
      "use-isnan": "off",
      "valid-typeof": "off"
    }
  }
];

export default eslintConfig;
