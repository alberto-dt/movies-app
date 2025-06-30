module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@constants/(.*)$': '<rootDir>/src/constants/$1',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@pages/(.*)$': '<rootDir>/src/pages/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1'
    },
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
    transformIgnorePatterns: [
        'node_modules/(?!(msw|@bundled-es-modules)/)'
    ],
    moduleFileExtensions: ['js', 'jsx', 'json'],
    testMatch: [
        '<rootDir>/__tests__/**/*.test.{js,jsx}',
        '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
        '<rootDir>/src/**/*.{test,spec}.{js,jsx}'
    ],
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/index.js',
        '!src/serviceWorker.js',
        '!src/**/*.stories.js',
        '!src/**/*.test.js'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    coverageReporters: ['text', 'lcov', 'html'],
    testTimeout: 10000,
    clearMocks: true,
    restoreMocks: true
}
