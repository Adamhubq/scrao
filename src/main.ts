
import * as puppeteer from "puppeteer";
// import * as fs from "fs";
import { download } from './download';
import * as oracleConnect from "./oracle-connect";
// import { arrayExpression } from '@babel/types';
// import * as oracledb from "oracledb";

export const getArrayLink: any = async (page) => {
    try {
        const pretier = await page.$('.ptb-new-left-menu-firts');
        const postsSelector = 'a';
        await page.waitForSelector(postsSelector, {
            timeout: 0
        });

        console.log(pretier);
        return (await pretier.$$eval( // запрос списка ссылок
            postsSelector, postLinks => postLinks.map((link, _arrayJson) => {
                return link.href;
            }))).filter(value => value.indexOf('section.php') + 1);
    } catch (error) {
        console.log(error);
        console.log('getArrayLink')
    }
}

export async function initPageCategory(page, araayLinkCategory) {
    const arrayElementLinks = [];
    const oracleConnetcObject: oracleConnect.CreateImg = new oracleConnect.DataBaseOracleAccess();
    await oracleConnetcObject.initialObjectconstructor()
    for (let elementLink = araayLinkCategory.length; elementLink--;) {
        try {
            console.log('iter - ' + araayLinkCategory[elementLink]);
            console.log(araayLinkCategory[elementLink]);
            await page.goto(araayLinkCategory[elementLink]);

            const selImg = '.image';
            const arrayElementImage = await page.evaluate(
                () => !document.querySelector('.image') || document.querySelector('.image').classList.length - 1
            )
            if (typeof arrayElementImage === 'boolean') return console.log("не найдены элементы image");
            await page.waitForSelector(selImg, {
                timeout: 0
            });
            const arrayLink = await page.$$eval( // запрос списка ссылок
                selImg, postLinks => postLinks.map((link, _arrayJson) => {
                    return link.href;
                }));


            const arrLinkElement = await initPageElement(page, arrayLink);

            await oracleConnetcObject.getCollection(arrLinkElement);

            for (let increment = oracleConnetcObject.dbObjectClassProtoSet.length; increment--;) {
                let elem = oracleConnetcObject.dbObjectClassProtoSet[increment];
                await download(elem.URL, `image/${elem.ARTICLE.replace(/[\\,\/]/gim, '*')}_z.png`);
                console.log('done -' + elem.URL);
                console.log(elem);
            }

            await oracleConnetcObject.setCollection();

            arrayLink.map((value, _index) => {
                arrayElementLinks.push(value);
            })


        } catch (error) {
            console.log(error);
            console.log('initPageCategory -> loop For')
        }
    }
    return arrayElementLinks;
}


async function initPageElement(page, arrayLinkElement) {
    const jsonArray = []
    for (let elementLink = arrayLinkElement.length; elementLink--;) {
        try {
            console.log(arrayLinkElement[elementLink])
            console.log('arrayLinkElement[elementLink]')
            await page.goto(arrayLinkElement[elementLink]);

            const urlImage = await page.evaluate(
                () => !document.querySelector('a.fancybox') ?
                    document.querySelector('#gallery-carousel').querySelector('img').src :
                    document.querySelector('a.fancybox')["href"]
            );

            // const originName = urlImage.slice(urlImage.lastIndexOf('/') + 1, urlImage.length)
            const originName = urlImage;

            const artikuls = await page.evaluate(
                () => !document.querySelector('.km-detail-new-props-two') ?
                    document.querySelector('#element-info').querySelector('strong').textContent :
                    document.querySelector('.km-detail-new-props-two').querySelector('span').textContent);



            jsonArray.push({
                ARTICLE: artikuls.toLowerCase().trim(),
                PATH: `/image/${artikuls}.png`.toLowerCase().trim(),
                FILENAME: originName.toLowerCase().trim().slice(originName.lastIndexOf('/') + 1, originName.length),
                URL: originName.toLowerCase().trim()
            })

        } catch (error) {
            console.log(error);
            console.log('getArrayLink')
        }
    }
    return jsonArray;
}

// async function loopArrayProtoSet(page, oracleConnetcObject, arrayElementLinks) {
//     const ale = await initPageCategory(page, links);
//     await oracleConnetcObject.getCollection(array);
// }

(async () => { 

    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.goto('https://krasnodar.kerama-marazzi.com/ru/production/');
    const arrayCategory = await getArrayLink(page);
    await initPageCategory(page, arrayCategory);
    await browser.close();

})();
