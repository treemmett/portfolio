const config = {
  '*': ['prettier -l', 'cspell --gitignore'],
  '*.(css|scss)': 'stylelint',
  '*.(ts|tsx)': () => 'tsc --skipLibCheck --noEmit',
  '*.(ts|tsx|js|jsx)': 'eslint',
};

export default config;
