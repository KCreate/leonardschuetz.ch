module.exports = {
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
            impliedStrict: true
        },
    },
    plugins: [
        'react',
    ],
    env: {
        browser: true,
        node: true,
        es6: true
    },
    rules: {
        "prefer-const": ["error", {
            destructuring: "any"
        }],
        "no-const-assign": "error",
        "no-var": "error",
        "no-new-object": "error",
        "object-shorthand": ["error", "always"],
        "no-array-constructor": "error",
        "array-callback-return": "error",
        "quote-props": ["error", "as-needed"],
        quotes: ["error", "single"],
        "no-useless-escape": "error",
        "wrap-iife": ["error", "inside"],
        "no-loop-func": "error",
        "prefer-arrow-callback": ["error", {
            allowNamedFunctions: true
        }],
        "arrow-spacing": ["error", {
            before: true,
            after: true
        }],
        "arrow-parens": ["error", "always"],
        "no-useless-constructor": "error",
        "no-dupe-class-members": "error",
        "no-duplicate-imports": "error",
        "no-iterator": "error",
        eqeqeq: ["error", "smart"],
        "no-case-declarations": "error",
        "no-nested-ternary": "error",
        "brace-style": ["error",
            "1tbs"
        ],
        indent: "error",
        "space-before-blocks": "error",
        "keyword-spacing": ["error", {
            before: true,
            after: true
        }],
        "space-infix-ops": "error",
        "no-whitespace-before-property": "error",
        "space-in-parens": ["error", "never"],
        "object-curly-spacing": ["error", "always"],
        "max-len": ["error", {
            code: 140,
            comments: 140,
            ignoreUrls: true
        }],
        "comma-style": ["error", "last"],
        "comma-dangle": ["error", "always-multiline"],
        semi: ["error", "always"],
        radix: ["error", "always"],
        camelcase: ["error", {
            properties: "always"
        }],
        "new-cap": "error",
        "no-underscore-dangle": "error"
    }
};
