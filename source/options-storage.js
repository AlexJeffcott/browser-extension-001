import OptionsSync from 'webext-options-sync';

export default new OptionsSync({
	defaults: {
		blacklistedSites: [],
		lang: 'auto',
		snippetsLastFetched: {en: 1591717064327, de: 1591717064327}
	},
	migrations: [
		OptionsSync.migrations.removeUnused
	],
	logging: true
});
