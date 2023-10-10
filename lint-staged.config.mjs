const config = {
  '*': ['prettier -l', 'cspell --gitignore --no-must-find-files'],
  '*.(ts|tsx)': () => 'tsc --skipLibCheck --noEmit',
  '*.(ts|tsx|js|jsx)': 'eslint',
};

export default config;
