const puppeteer = require('puppeteer')
const userAgent = require('user-agents')

const collection_name = 'solsunsets'
const payload = {
    "$match": { "collectionSymbol": `${collection_name}`},
    "$sort": { "price": -1 },
    "$skip": 0,
    "$limit": 20
}

const url_collection = `https://api-mainnet.magiceden.io/rpc/getCollectionEscrowStats/${collection_name}`
const url_nfts = `https://api-mainnet.magiceden.io/rpc/getListedNFTsByQuery?q=`

async function main() {
    const brower = await puppeteer.launch({ headless: true })
    const page = await brower.newPage()
    await page.setUserAgent(userAgent.toString())
    await page.goto(url_collection)
    var collection = await page.evaluate(() =>  {
        return JSON.parse(document.querySelector("body").innerText); 
    });
    console.log("Collection", collection_name, "Listed:", collection.results.listedCount);
    var nfts = [];
    for(let i = 0; i < collection.results.listedCount;) {
        var temp_payload = payload;
        temp_payload["$skip"] = i;
        await page.goto(`${url_nfts}${encodeURIComponent(JSON.stringify(temp_payload))}`);
        var new_nfts = await page.evaluate(() =>  {
            return JSON.parse(document.querySelector("body").innerText); 
        });
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        nfts.push(...new_nfts.results)
        process.stdout.write(`Getting ${nfts.length} / ${collection.results.listedCount}`)
        await page.waitForTimeout(505)
        i += new_nfts.results.length
    }

    for(let i = 0; i < nfts.length; i++) {
        console.log(nfts[i].title, nfts[i].price)
    }
    console.log("Collection", collection_name, "Listed:", collection.results.listedCount);

    await brower.close()
}

main();