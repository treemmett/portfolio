const config = {
  '*': ['prettier -l', 'cspell'],
  '*.(css|scss)': 'stylelint',
  '*.(ts|tsx)': () => 'tsc --skipLibCheck --noEmit',
  '*.(ts|tsx|js|jsx)': 'eslint',
};

export default config;
