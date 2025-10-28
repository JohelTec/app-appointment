import type { Config } from 'jest';

const config: Config = {
  // Usa ts-jest para compilar TypeScript
  preset: 'ts-jest',

  // Entorno Node.js (recomendado para Lambdas)
  testEnvironment: 'node',

  // Carpeta donde Jest buscará los tests
  roots: ['<rootDir>/src'],

  // Extensiones que reconocerá Jest
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Permite usar imports como "@/domain/..." en vez de rutas relativas
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Patrón para detectar archivos de test
  testMatch: ['**/*.spec.ts'],

  // Reporte de cobertura
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts', // ignora archivos índice
  ],
  coverageDirectory: 'coverage',

  // Limpieza y verbosity
  clearMocks: true,
  verbose: true,
};

export default config;
