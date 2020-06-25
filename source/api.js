import optionsStorage from './options-storage';
import snippetsEN from './media/snippets_en.json';
import snippetsDE from './media/snippets_de.json';

function getSnippets(lang) {
	if (lang !== 'en' && lang !== 'de') {
		return;
	}

	return fetch(`https://storage.googleapis.com/amboss-browser-plugin/snippets_${lang}.json`)
		.then(response => response.json());
}

function getLastFetchedSnippetsDate(lang) {
	if (lang !== 'en' && lang !== 'de') {
		return;
	}

	return fetch(`https://storage.googleapis.com/amboss-browser-plugin/snippets_${lang}.json`, {method: 'HEAD'})
		.then(response => response.headers.get('last-modified'));
}

export async function getData(lang) {
	const storageData = await optionsStorage.getAll();
	const {snippetsLastFetched} = storageData;

	const snippetLastModified = await getLastFetchedSnippetsDate(lang);

	const wasModifedSinceLastFetch = new Date(snippetLastModified).getMilliseconds() > snippetsLastFetched[lang]

	if (wasModifedSinceLastFetch) {
		const snippets = await getSnippets(lang);
		const snippetsWithDescriptionsAndDestinations = snippets.filter(i => i.description && i.destinations.length);
		const snippetsWithDescriptionsAndDestinationsSorted = snippetsWithDescriptionsAndDestinations.sort((a, b) => a.title < b.title ? -1 : 1);

		optionsStorage.set({snippetLastFetched: {...snippetLastFetched, [lang]: Date.now()}});
		return snippetsWithDescriptionsAndDestinationsSorted;
	}

	return lang === 'en' ? snippetsEN : snippetsDE;
}
