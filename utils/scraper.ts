import chromium from "@sparticuz/chromium-min";
import puppeteerCore, { Browser, Page } from "puppeteer-core";
// import puppeteer from "puppeteer";

export interface ApartmentData {
  price: number;
  sqMeters: number;
  plan: string;
  projectName: string;
  roomsCount: number;
  imageUrl: string;
  floor: number;
  link: string;
  status: string;
  tag: string;
  projectLink: string;
}

const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browser) return browser;

  if (process.env.NEXT_PUBLIC_VERCEL_ENVIRONMENT === "production") {
    browser = await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(remoteExecutablePath),
      headless: true,
    });
  } else {
    browser = await puppeteerCore.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
  }
  return browser;
}

export async function scrapeBonavaApartments(): Promise<ApartmentData[]> {
  const browser = await getBrowser();
  if (!browser) {
    throw new Error("Failed to initialize browser");
  }
  let page: Page | null = null;

  try {
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto("https://www.bonava.lv/dzivokli", {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Accept cookies if the button is present
    try {
      await page.waitForSelector("#onetrust-accept-btn-handler", {
        timeout: 5000,
      });
      await page.click("#onetrust-accept-btn-handler");
      await new Promise((res) => setTimeout(res, 1000));
    } catch {}

    await page.waitForSelector(".product-search__card-grid", {
      timeout: 10000,
    });

    // Scrape apartment data from the page
    const apartments: ApartmentData[] = await page.evaluate(() => {
      const results: ApartmentData[] = [];
      const cards = document.querySelectorAll(".neighbourhood-card");

      cards.forEach((card) => {
        const projectName =
          card
            .querySelector(".neighbourhood-card__heading")
            ?.textContent?.trim() || "";
        const projectLink =
          (
            card.querySelector(
              ".neighbourhood-card__info > div > div:nth-child(2) > a"
            ) as HTMLAnchorElement
          )?.href || "";

        // Get all apartments in this project
        const apartmentCards = card.querySelectorAll(".home-card");
        apartmentCards.forEach((aptCard) => {
          const imageUrl =
            aptCard
              .querySelector(".home-card__image-desktop img")
              ?.getAttribute("src") || "";
          const title =
            aptCard.querySelector(".home-card__heading")?.textContent?.trim() ||
            "";
          const link =
            aptCard
              .querySelector(".home-card__call-to-action a")
              ?.getAttribute("href") || "";

          // Get facts (room numbers, sq meters, price, floor)
          const facts = Array.from(
            aptCard.querySelectorAll(".home-card__fact__text")
          ).map((el) => el.textContent?.trim() || "");

          const roomsCount = parseInt(
            facts[0]?.replace(/[^0-9]/g, "") || "0",
            10
          );
          const sqMeters = parseFloat(facts[1]?.replace(/[^0-9.]/g, "") || "0");
          const price = parseFloat(facts[2]?.replace(/[^0-9.]/g, "") || "0");
          const floor = parseInt(facts[3]?.replace(/[^0-9]/g, "") || "0", 10);

          const status =
            aptCard
              .querySelector(".sales-status__label")
              ?.textContent?.trim() || "";
          const tags = Array.from(aptCard.querySelectorAll(".offering-tag"))
            .map((el) => el.textContent?.trim() || "")
            .filter(Boolean);

          results.push({
            projectName,
            price,
            sqMeters,
            plan: title,
            roomsCount,
            imageUrl,
            floor,
            link,
            status,
            tag: JSON.stringify(tags),
            projectLink,
          });
        });
      });

      return results;
    });

    return apartments;
  } catch (error) {
    console.error("Error scraping apartments:", error);
    throw error;
  } finally {
    if (page) {
      await page.close();
    }
  }
}
