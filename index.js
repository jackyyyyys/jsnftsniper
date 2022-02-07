const puppeteer = require('puppeteer')
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')
const userAgent = require('user-agents')
const fs = require('fs/promises')
const util = require('util')

const collection_name = 'solsunsets'
const payload = {
    "$match": { "collectionSymbol": 'solsunsets'},
    "$sort": { "price": -1 },
    "$skip": 0,
    "$limit": 20
}

const url_all_collections = 'https://api-mainnet.magiceden.io/all_collections'
const url_collection = `https://api-mainnet.magiceden.io/rpc/getCollectionEscrowStats/${collection_name}`
const url_nfts = `https://api-mainnet.magiceden.io/rpc/getListedNFTsByQuery?q=`
const url = `https://magiceden.io/marketplace/${collection_name}`

async function main() {
    const brower = await puppeteer.launch({ headless: true })
    const page = await brower.newPage()
    await page.setUserAgent(userAgent.toString())
    await page.goto(url_collection)
    collection = await page.evaluate(() =>  {
        return JSON.parse(document.querySelector("body").innerText); 
    });
    console.log("Listed: ", collection.results.listedCount);
    nfts = [];
    for(var i = 0; i < collection.results.listedCount;) {
        temp_payload = payload
        temp_payload["$skip"] = i
        // temp_url = `${url_nfts}${encodeURIComponent(JSON.stringify(temp_payload))}`
        // console.log(temp_url)
        await page.goto(`${url_nfts}${encodeURIComponent(JSON.stringify(temp_payload))}`)
        new_nfts = await page.evaluate(() =>  {
            return JSON.parse(document.querySelector("body").innerText); 
        });
        console.log("i=", i, "# got", new_nfts.results.length, "total:", nfts.length)
        nfts.push(...new_nfts.results)
        await page.waitForTimeout(800)
        i += new_nfts.results.length
    }
    // await page.setViewport({
    //     width: 1200,
    //     height: 800
    // });

    // const total_listed_count = await page.evaluate(() => {
    //     return document.querySelector("div.collection-info > div.pt-2 > div > div > div:nth-child(4) > div > span.text-white.fs-14px.text-truncate.attribute-value").textContent
    // })

    console.log("Ended: ", nfts.length)
    for(var i = 0; i < nfts.length; i++) {
        console.log(nfts[i].title, nfts[i].price)
    }

    // console.log("Listed: ", total_listed_count);

    await page.waitForTimeout(800)
    // await page.screenshot({path: "lmao.png", fullPage: true})

    // // LEN at first load (20)
    // var len = await page.evaluate( async () => {
    //     return Array.from(document.querySelectorAll("h6.grid-card__title")).length
    // })
    // console.log("starting: ", len)
    
    // scroll change to sue this
    // https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore
    // const delay = 3000;
    // const wait = (ms) => new Promise(res => setTimeout(res, ms));
    // const count = async () => {
    //     await page.evaluate( async() => {
    //         return Array.from(document.querySelectorAll("h6.grid-card__title")).length
    //     })
    // };
    // const scrollDown = async () => {
    //     await page.evaluate( async () => {
    //         hi = Array.from(document.querySelector('.grid-card__title:last-child'))
    //         console.log(hi);
    //         //????????
    //         return hi.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'end' })
    //     })
    // }

    // let preCount = 0;
    // let postCount = 0;
    // do {
    //     preCount = await count();
    //     await scrollDown();
    //     await wait(delay);
    //     postCount = await count();
    // } while (postCount > preCount);
    // await wait(delay);


    // const nfts = await page.evaluate( async () => {
    //     var s = 0;

    //     // start gathering
    //     var temp = []
    //     var names = Array.from(document.querySelectorAll("h6.grid-card__title")).map(x => x.textContent)
    //     var prices = Array.from(document.querySelectorAll("div.card__price > span")).map(x => x.textContent)
    //     var images = Array.from(document.querySelectorAll("img.card-img-top")).map(x => x.src)
    //     names.forEach((name, index) => {
    //         temp.push({
    //             name: names[index],
    //             price: prices[index],
    //             image: images[index]
    //         })
    //     });
    //     return temp;
    // })

    // console.log(nfts)
    // console.log(nfts.length)
    // await fs.writeFile("lmao.txt", JSON.stringify(nfts, null, 2))
    await brower.close()
}


main();