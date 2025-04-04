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
        const customStyles = fs.readFileSync(BILIBILI_CARD_STYEL);
        if ($("style").text().indexOf(customStyles) === -1) {
            $("head").append(`<style>${customStyles}</style>`);
        }
    }
    // Iterate through each link
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const href = $(link).attr("href");
        const url = new URL(href);
        const pathParts = url.pathname.split("/").filter(Boolean); // 分割路径并过滤空字符串
        const bilibiliId = pathParts[pathParts.length - 1];
        const rest = await createCard(imageProxy, bilibiliId);
        const errorStr = '<p class="title">出错了！</p>';
        if (rest.includes(errorStr)) {
            console.log(`Error: parse for ${href}`);
        } else {
            // Replace the URL with the rendering result
            $(link).replaceWith(rest);
        }
    }
    return $.html();
}

module.exports = replaceBilibiliUrls;
