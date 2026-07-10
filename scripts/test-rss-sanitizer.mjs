import assert from "node:assert/strict";
import { decodeRssText } from "../lib/rss.js";

const escapedGoogleNewsDescription = "&lt;a href=\"https://news.google.com/rss/articles/example\" target=\"_blank\"&gt;交易项目编号：S110000C005110038001&lt;/a&gt; &lt;font color=\"#6f6f6f\"&gt;北京市公共资源交易服务平台&lt;/font&gt;";
const summary = decodeRssText(escapedGoogleNewsDescription);

assert.match(summary, /交易项目编号：S110000C005110038001/);
assert.match(summary, /北京市公共资源交易服务平台/);
assert.doesNotMatch(summary, /href=|<a\s|<font/i);

console.log("RSS summary sanitizer passed");
