import puppeteer from "puppeteer";

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

export async function scrapeBonavaApartments(): Promise<ApartmentData[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920x1080",
    ],
  });

  try {
    const page = await browser.newPage();
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
      // This function runs in the browser context
      const results: ApartmentData[] = [];
      // You may need to adjust selectors based on the actual DOM structure
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
        // You may need to click to open modal and extract apartments per project
        // For simplicity, this example just collects project names and links
        results.push({
          projectName,
          price: 0,
          sqMeters: 0,
          plan: "",
          roomsCount: 0,
          imageUrl: "",
          floor: 0,
          link: "",
          status: "",
          tag: "",
          projectLink,
        });
      });
      return results;
    });

    return apartments;
  } catch (error) {
    console.error("Error scraping apartments:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
