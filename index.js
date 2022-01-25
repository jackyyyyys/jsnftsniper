const puppeteer = require('puppeteer')
const userAgent = require('user-agents')
const fs = require('fs/promises')
const util = require('util')

const collection_name = 'solsunsets'

async function main() {
    const url = `https://magiceden.io/marketplace/${collection_name}`
    const brower = await puppeteer.launch()
    const page = await brower.newPage()
    await page.setUserAgent(userAgent.toString())
    await page.goto(url)
    await page.waitForTimeout(1000)
    // await page.screenshot({path: "lmao.png", fullPage: true})

    // const temp = await page.$$eval("div.grid-card__main", nfts => {
    //     return nfts.$$eval('div').length;
    // })

    const nfts = await page.evaluate(() => {
        return {
            name: [Array.from(document.querySelectorAll("h6.grid-card__title")).map(x => x.textContent)],
            price: [Array.from(document.querySelectorAll("div.card__price > span")).map(x => x.textContent)]
        }
    })

    await console.log(temp);
    await fs.writeFile("lmao.txt", JSON.stringify(nfts, null, 2))
    await brower.close()
}

main();