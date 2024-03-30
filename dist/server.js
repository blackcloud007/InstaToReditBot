"use strict";
// ToDo
// [x] - get top 3 post in past 24hrs from r/animemes
// [x] - check if post is posted
// [x] - if not poseted then post
// [x] - add post to posted_list
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// https://www.reddit.com/r/Animemes/top.json?limit=3 - {url, id, title, author}
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const reddit2insta_1 = require("./reddit2insta");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const port = 3000;
// For parsing application/json
app.use(express_1.default.json());
// For parsing application/x-www-form-urlencoded
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.json({
        autopost_memes: req.protocol + "://" + req.get("host") + `/reddit2insta`,
        github: "https://github.com/",
        insta_url: `https://www.instagram.com/${process.env.IG_USERNAME}/`,
    });
});
app.get("/reddit2insta", async (req, res) => {
    const top_x = req.body.top_x;
    const msg = await (0, reddit2insta_1.reddit2insta)(process.env.IG_USERNAME, process.env.IG_PASSWORD, process.env.R_SUB, process.env.IG_HASHTAGS, top_x);
    res.json({
        status: msg ? msg : "FAILURE - YOU SHOULDN'T BE SEEING THIS AT ALL",
    });
});
app.listen(port, () => console.log(`🚀 @ http://localhost:${port}`));
