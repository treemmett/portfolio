const config = {
  '*': ['prettier -l', 'cspell --gitignore --no-must-find-files'],
  '*.(css|scss)': 'stylelint',
  '*.(ts|tsx)': () => 'tsc --skipLibCheck --noEmit',
  '*.(ts|tsx|js|jsx)': 'eslint',
};

export default config;
