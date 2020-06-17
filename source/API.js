import { compareAsc } from 'date-fns'

import optionsStorage from './options-storage'
import snippetsEN from './snippets_en.json'
import snippetsDE from './snippets_de.json'

function getSnippets(lang) {
	if (lang !== "en" && lang !== "de") return
	return fetch(`https://storage.googleapis.com/amboss-browser-plugin/snippets_${lang}.json`)
		.then(response => response.json())
}

function getLastFetchedSnippetsDate(lang) {
	if (lang !== "en" && lang !== "de") return
	return fetch(`https://storage.googleapis.com/amboss-browser-plugin/snippets_${lang}.json`, {"method": "HEAD"})
		.then(response => response.headers.get('last-modified'))
}

export async function getData(lang){
	const storageData = await optionsStorage.getAll()
	const { snippetLastFetched } = storageData

	const snippetLastModified = await getLastFetchedSnippetsDate(lang)
	const wasModifedSinceLastFetch = compareAsc(new Date(snippetLastModified), new Date(snippetLastFetched)) === 1
	const shouldFetch = wasModifedSinceLastFetch

	if(!!shouldFetch) {
		const snippets = await getSnippets(lang)
		const snippetsWithDestinations = snippets.filter(i => i.destinations.length)
		const snippetsWithDestinationsSorted = snippetsWithDestinations.sort((a, b) => a.title < b.title ? -1 : 1)

		optionsStorage.set({ snippetLastFetched: {...snippetLastFetched, [lang]: Date.now() }})
		return snippetsWithDestinationsSorted
	}
	return lang === 'en' ? snippetsEN : snippetsDE
}
