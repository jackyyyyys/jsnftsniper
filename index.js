const puppeteer = require('puppeteer')
const { scrollPageToBottom } = require('puppeteer-autoscroll-down')
const userAgent = require('user-agents')
const fs = require('fs/promises')
const util = require('util')

const collection_name = 'solsunsets'

async function main() {
    const url = `https://magiceden.io/marketplace/${collection_name}`

    const brower = await puppeteer.launch({
        headless: false
    })
    const page = await brower.newPage()
    await page.setUserAgent(userAgent.toString())
    await page.goto(url)
    await page.setViewport({
        width: 1200,
        height: 800
    });

    const total_listed_count = await page.evaluate(() => {
        return document.querySelector("div.collection-info > div.pt-2 > div > div > div:nth-child(4) > div > span.text-white.fs-14px.text-truncate.attribute-value").textContent
    })

    console.log("Listed: ", total_listed_count);

    await page.waitForTimeout(800)

    // const lastPosition = await scrollPageToBottom(page, {
    //     size: 100000,
    //     delay: 10
    // })

    // await page.screenshot({path: "lmao.png", fullPage: true})
    var len = await page.evaluate( async () => {
        return Array.from(document.querySelectorAll("h6.grid-card__title")).length
    })
    console.log("starting: ", len)
    
    const nfts = await page.evaluate( async () => {
        var s = 0;
        // keep scrolling until items = length
        await new Promise((resolve, reject) => {
            var distance = 10000;
            var timer = setInterval(() => {
                console.log("scroll: ", s)
                window.scrollBy(0, distance);
                // not getting len ??!!
                var len = page.evaluate( () => {
                 return Array.from(document.querySelectorAll("h6.grid-card__title")).length
                })
                console.log(len)
                if(len >= total_listed_count){
                    clearInterval(timer);
                    resolve();
                }
                s += 1;
            }, 100);
        })
        // start gathering
        var temp = []
        var names = Array.from(document.querySelectorAll("h6.grid-card__title")).map(x => x.textContent)
        var prices = Array.from(document.querySelectorAll("div.card__price > span")).map(x => x.textContent)
        var images = Array.from(document.querySelectorAll("img.card-img-top")).map(x => x.src)
        names.forEach((name, index) => {
            temp.push({
                name: names[index],
                price: prices[index],
                image: images[index]
            })
        });
        return temp;
    })

    // console.log(nfts)
    console.log(nfts.length)
    // await fs.writeFile("lmao.txt", JSON.stringify(nfts, null, 2))
    await brower.close()
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 10000;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= 1000000){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

main();