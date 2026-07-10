const decodeEntities = (value) => value
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, "\"")
  .replace(/&nbsp;/gi, " ")
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

export function decodeRssText(value = "") {
  let clean = value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  clean = decodeEntities(decodeEntities(clean));
  return clean
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
