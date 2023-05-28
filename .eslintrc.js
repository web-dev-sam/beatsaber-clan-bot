module.exports = {
	extends: '@sapphire',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module'
	},
	rules: {
		quotes: ['error', 'double']
	}
};
