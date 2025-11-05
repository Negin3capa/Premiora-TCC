module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
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
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 72],
  },
};
