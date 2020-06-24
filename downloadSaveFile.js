const fetch = require(`node-fetch`)
const fs = require(`fs`)

const { lang } = require('minimist')(process.argv.slice(2));

fetch(`https://storage.googleapis.com/amboss-browser-plugin/snippets_${lang}.json`)
  .then(result => result.json())
  .then(async (data) => {
    const normalisedData = await data.filter(i => i.description && i.destinations.length && i.destinations[0].lc_xid).sort((a, b) => a.title < b.title ? -1 : 1);
    fs.writeFile(
      `./source/snippets_${lang}.json`,
      JSON.stringify(normalisedData),
      err =>
        err
          ? console.error(
              `Error writing snippets_${lang}`,
              err
            )
          : console.log(
              `snippets_${lang} successfully saved!`
            )
    )
  })
