import axios from "axios";
import { XMLParser } from "fast-xml-parser";

const IMD_CAP_RSS_URL =
  "https://cap-sources.s3.amazonaws.com/in-imd-en/rss.xml";

const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

async function fetchXml(url) {
  const response = await axios.get(url, {
    responseType: "text",
    timeout: 15000,
  });

  return response.data;
}

/**
 * Fetch the official IMD CAP RSS feed
 * and extract the alert metadata + CAP XML URLs.
 */
export async function getImdCapFeed() {
  const rssXml = await fetchXml(IMD_CAP_RSS_URL);

  const rss = parser.parse(rssXml);

  const items = rss?.rss?.channel?.item ?? [];

  const itemArray = Array.isArray(items) ? items : [items];

  return itemArray
    .filter(Boolean)
    .map((item) => ({
      title: item.title ?? null,
      description: item.description ?? null,
      url: item.link ?? null,
      guid: item.guid ?? null,
      publishedAt: item.pubDate ?? null,
    }));
}

/**
 * Fetch individual CAP XML documents
 * referenced by the IMD RSS feed.
 */
export async function getImdCapAlerts(limit = 10) {
  const feedItems = await getImdCapFeed();

  const selectedItems = feedItems
    .filter((item) => item.url)
    .slice(0, limit);

  const alerts = await Promise.all(
    selectedItems.map(async (item) => {
      const xml = await fetchXml(item.url);

      return {
        ...item,
        xml,
      };
    })
  );

  return alerts;
}