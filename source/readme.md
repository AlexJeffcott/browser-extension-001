# Browser Extension

## Content
The latest snippet files for en and de respectively can be downloaded and saved with the following:
```sh
    curl 'https://storage.googleapis.com/amboss-browser-plugin/snippets_en.json' -o ./source/snippets_en.json
    curl 'https://storage.googleapis.com/amboss-browser-plugin/snippets_de.json' -o ./source/snippets_de.json
```
NB Please remember to update the snippetsLastFetched property in the default values of options-storage.js.

## Analytics
This is the url of the segment (analytics dashboard)
```https://app.segment.com/amboss-staging/sources/amboss_browser_extension/schema/events```


## Maintainence
- browser-polyfill.min.js should be updated periodically
- the segment IIFE in tracking-helpers.js should be updated periodically
- the content (see above) should be updated with EVERY version

## TODO
0. add icons
0. add screenshots
0. add AMBOSS loading spinner
0. add feedback form
0. direct users to hubspot form on uninstall
0. find a better (less network intensive) way to update content without the user updating the extension
0. add browser-action badges for updating and the number of items found (for the glossary)
0. add term feedback mechanism (dismiss if not interested?)
0. add blacklisted terms mechanism
0. add create custom question session based on terms in this page button
