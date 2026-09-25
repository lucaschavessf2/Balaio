import nextConfig from 'eslint-config-next/core-web-vitals'
import nextTypescriptConfig from 'eslint-config-next/typescript'

const config = [
  ...nextConfig,
  ...nextTypescriptConfig,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'import/no-anonymous-default-export': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default config
