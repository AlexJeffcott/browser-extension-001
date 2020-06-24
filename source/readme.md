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
This is the documentation for events
```https://www.notion.so/amboss1/Browser-Extension-c995a9d35da945f09f5dd49dcf9806ce```

## Maintainence
- browser-polyfill.min.js should be updated periodically
- the segment IIFE in tracking-helpers.js should be updated periodically
- the content (see above) should be updated with EVERY version
- ensure that babel is building for the minimum versions defined in the manifest


## To download and clean content
```javascript
const fetch = require(`node-fetch`)
   const fs = require(`fs`)

   fetch('https://storage.googleapis.com/amboss-browser-plugin/snippets_de.json')
     .then(result => result.json())
     .then(async (data) => {
       const normalisedData = await data.filter(i => i.description && i.destinations.length).sort((a, b) => a.title < b.title ? -1 : 1);
       fs.writeFile(
         `./snippets_de.json`,
         JSON.stringify(normalisedData),
         err =>
           err
             ? console.error(
                 `Error writing snippets_de`,
                 err
               )
             : console.log(
                 `snippets_de successfully saved!`
               )
       )
     })
```
## TODO
0. add icons
0. add screenshots
0. add AMBOSS loading spinner
0. add feedback form
0. direct users to hubspot form on uninstall
0. use indicative.com
0. further optimise build
0. publish to firefox and edge
0. find a better (less network intensive) way to update content without the user updating the extension
0. add browser-action badges for pushing new updates, and the number of items found (for the glossary)
0. add term feedback mechanism (dismiss if not interested?)
0. add blacklisted terms mechanism
0. add create custom question session based on terms in this page button
0. implement segment Typewriter
0. extend the test.html to include edge cases etc to ease testing
0. create Cypress tests against the above
