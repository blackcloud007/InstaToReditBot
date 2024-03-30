"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reddit2insta = void 0;
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const path_1 = require("path");
const request_promise_1 = require("request-promise");
const instagram_private_api_1 = require("instagram-private-api");
let animemes;
const posted_animemes_location = (0, path_1.join)(".", "posted_memes.json");
const reddit2insta = async (ig_uname, ig_pass, subreddit, ig_hashtags, top_x) => {
    const ig = new instagram_private_api_1.IgApiClient();
    ig.state.generateDevice(ig_uname);
    // logging into instagram
    try {
        const auth = await ig.account.login(ig_uname, ig_pass);
        if (!auth.pk)
            return "LOGIN FAILED";
    }
    catch (error) {
        console.log(error);
        return "LOGIN BLOCKED";
    }
    // fetching past memes
    const raw_pa = fs_1.default.readFileSync(posted_animemes_location);
    const posted_animemes = JSON.parse(raw_pa.toString());
    // fetching new memes from reddit
    const res = await axios_1.default.get(`https://www.reddit.com/r/${subreddit}/top.json?limit=${top_x ? top_x : 3}`);
    animemes = res.data.data.children;
    // inspecting new meme
    animemes.forEach(async (animeme, i) => {
        console.log("\n" + animeme.data.title);
        // check if meme is image and new
        if (animeme.data.url.split(".")[0].split("://")[1] === "v") {
            console.log(":( video");
            return null;
        }
        if (posted_animemes[animeme.data.id]) {
            console.log("seen this!");
            return null;
        }
        const animeme_to_post = {
            title: animeme.data.title,
            author: animeme.data.author,
            url: animeme.data.url,
        };
        // generate buffer from image
        const imageBuffer = await (0, request_promise_1.get)({
            url: animeme_to_post.url,
            encoding: null,
        });
        // hashtag generation
        const hashtag_list = ig_hashtags.split(" ");
        const hashtags = hashtag_list.reduce((hashtags, hashtag) => {
            return hashtags + ` #${hashtag}`;
        });
        try {
            const publishResult = await ig.publish.photo({
                file: imageBuffer,
                caption: `credits: u/${animeme_to_post.author}\n${animeme_to_post.title} ¯\\_(ツ)_/¯\n.\n.\n.\n.\n.\n#${hashtags}`,
            });
            console.log(animeme.data.url);
            if (publishResult.status === "ok") {
                // update list of posted memes
                posted_animemes[animeme.data.id] = animeme_to_post;
                fs_1.default.writeFileSync(posted_animemes_location, JSON.stringify(posted_animemes));
                console.log("updated posted memes");
            }
        }
        catch (error) {
            console.log("work on fixing that image size thing you sucker");
        }
    });
    return "SUCCESS - UPLOADING NEW IMAGE MEMES";
};
exports.reddit2insta = reddit2insta;
