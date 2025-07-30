/* eslint-disable @typescript-eslint/explicit-function-return-type */
const config = {
  "package.json": "sort-package-json",
  "*.{ts}": 'eslint --max-warnings=0 "src/**" --ext=.ts --fix',
  "**/*.ts": () => "tsc -p tsconfig.json",
};

export default config;
