module.exports = {
    // Entorno de testing
    testEnvironment: 'jsdom',

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

    // Module mapping (CORREGIDO: era "moduleNameMapping")
    moduleNameMapper: {
        // CSS modules
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

        // Alias paths
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@constants/(.*)$': '<rootDir>/src/constants/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@pages/(.*)$': '<rootDir>/src/pages/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1'
    },

    // Transform files
    transform: {
        '^.+\\.(js|jsx)$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', {
                    targets: { node: 'current' },
                    modules: 'commonjs'
                }],
                ['@babel/preset-react', { runtime: 'automatic' }]
            ]
        }]
    },

    // Ignore transforming node_modules except for ES modules
    transformIgnorePatterns: [
        'node_modules/(?!(msw|@bundled-es-modules)/)'
    ],

    // File extensions to consider
    moduleFileExtensions: ['js', 'jsx', 'json'],

    // Test patterns
    testMatch: [
        '<rootDir>/__tests__/**/*.test.{js,jsx}',
        '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
        '<rootDir>/src/**/*.{test,spec}.{js,jsx}'
    ],

    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/index.js',
        '!src/serviceWorker.js',
        '!src/**/*.stories.js',
        '!src/**/*.test.js'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },

    // Coverage reporters
    coverageReporters: ['text', 'lcov', 'html'],

    // Test timeout
    testTimeout: 10000,

    // Clear mocks automatically
    clearMocks: true,

    // Restore mocks automatically
    restoreMocks: true
}
