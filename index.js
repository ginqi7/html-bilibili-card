"use strict";
const fs = require("hexo-fs");
const path = require("path");
const { createCard } = require("./lib/bili.js");
const get = require("lodash.get");
const imageProxy = "https://images.weserv.nl/?url=";
const cheerio = require("cheerio");

const BILIBILI_CARD_STYEL = path.resolve(__dirname, "./source/bilicard.css");

async function replaceBilibiliUrls(html) {
    const $ = cheerio.load(html); // Load HTML
    // Query all <a> tags containing bilibili URL
    const links = $('a[href*="https://www.bilibili.com/video/"]');
    // Add Styles in the html.
    if (links.length > 0) {
        console.log(BILIBILI_CARD_STYEL);
        const customStyles = fs.readFileSync(BILIBILI_CARD_STYEL);
        if ($("style").text().indexOf(customStyles) === -1) {
            $("head").append(`<style>${customStyles}</style>`);
        }
    }
    // Iterate through each link
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const href = $(link).attr("href");
        console.log(href);
        // Extract bilibili type and ID
        const match = href.match(/https:\/\/www\.bilibili\.com\/video\/(.*)/);
        if (match && match[1]) {
            const bilibiliId = match[1];
            const rest = await createCard(imageProxy, bilibiliId);
            // Replace the URL with the rendering result
            $(link).replaceWith(rest);
        }
    }
    return $.html();
}

module.exports = replaceBilibiliUrls;
