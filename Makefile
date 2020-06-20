getLatestENSnippets:
	curl 'https://storage.googleapis.com/amboss-browser-plugin/snippets_en.json' -o ./source/snippets_en.json

getLatestDESnippets:
	curl 'https://storage.googleapis.com/amboss-browser-plugin/snippets_de.json' -o ./source/snippets_de.json

.PHONY: getLatestENSnippets getLatestDESnippets
