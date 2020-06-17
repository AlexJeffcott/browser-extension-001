setup:
	sudo -S n 11

start:
	npm run build:chrome

getLatestENSnippets:
	curl 'https://storage.googleapis.com/amboss-browser-plugin/snippets_en.json' -o ./common/js/background/englishsnippets.json

getLatestDESnippets:
	curl 'https://storage.googleapis.com/amboss-browser-plugin/snippets_de.json' -o ./common/js/background/germansnippets.json

prependEN:
	echo 'var enSeededSnippets = '| cat - ./common/js/background/englishsnippets.json > /tmp/out && mv /tmp/out ./common/js/background/englishsnippets.json

prependDE:
	echo 'var deSeededSnippets = '| cat - ./common/js/background/germansnippets.json > /tmp/out && mv /tmp/out ./common/js/background/germansnippets.json

.PHONY: setup start getLatestENSnippets getLatestDESnippets prependEN prependDE
