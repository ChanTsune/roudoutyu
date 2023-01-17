module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    env: {
      browser: true,
      es2021: true,
    },
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      project: "./tsconfig.eslint.json",
      tsconfigRootDir: __dirname,
    },
    ignorePatterns: ["dist"],
    extends: [
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      'plugin:@next/next/recommended',
    ],
    rules: {
      "import/prefer-default-export": "off",
      "@typescript-eslint/quotes": ["error", "double"],
    },
  };
