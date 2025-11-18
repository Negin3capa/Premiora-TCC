module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      1, // Changed from 2 (error) to 1 (warning) - conventional commits are now recommended but optional
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Mudanças na documentação
        'style',    // Mudanças de estilo (formatação, etc.)
        'refactor', // Refatoração de código
        'perf',     // Melhorias de performance
        'test',     // Adição ou correção de testes
        'chore',    // Mudanças em ferramentas/configuração
        'ci',       // Mudanças na configuração de CI
        'build',    // Mudanças no sistema de build
      ],
    ],
    'type-case': [1, 'always', 'lower-case'], // Changed from 2 to 1
    'type-empty': [1, 'never'], // Changed from 2 to 1
    'scope-case': [1, 'always', 'lower-case'], // Changed from 2 to 1
    'subject-case': [1, 'always', 'lower-case'], // Changed from 2 to 1
    'subject-empty': [1, 'never'], // Changed from 2 to 1
    'subject-full-stop': [1, 'never', '.'], // Changed from 2 to 1
    'header-max-length': [1, 'always', 72], // Changed from 2 to 1
    'body-max-line-length': [1, 'always', 72], // Changed from 2 to 1
  },
};
