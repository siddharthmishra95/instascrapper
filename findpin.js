const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapePinterestWithScroll(url) {
  const browser = await puppeteer.launch({
    timeout: 60000, // Increase the browser launch timeout
  });
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000, // Increase the page load timeout
    });

    // Scroll down to load more pins
    await page.evaluate(async () => {
      let scrollHeight = document.body.scrollHeight;
      let lastHeight = 0;
      while (scrollHeight > lastHeight) {
        lastHeight = scrollHeight;
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait longer for new content to load
        scrollHeight = document.body.scrollHeight;
      }
    });

    // Extract pin elements and check the highest index
    const pinCount = await page.evaluate(() => {
      const pins = document.querySelectorAll("[data-grid-item-idx]");
      if (pins.length === 0) return 0; // No pins found, return 0

      let maxIndex = 0;
      pins.forEach((pin) => {
        const idx = parseInt(pin.getAttribute("data-grid-item-idx"), 10);
        if (idx > maxIndex) {
          maxIndex = idx;
        }
      });

      return maxIndex + 1; // `maxIndex + 1` gives the total count
    });

    // Determine the count to display
    const displayCount = pinCount > 50 ? "50+" : pinCount;

    console.log(`Pin Count: ${displayCount}`);

    // // Get the HTML content of the page
    // const htmlContent = await page.content();

    // // Save HTML to a file
    // fs.writeFileSync("pinterest_page.html", htmlContent, "utf8");

    console.log("HTML content saved to pinterest_page.html");
  } catch (error) {
    console.error("Error scraping Pinterest:", error);
  } finally {
    await browser.close();
  }
}
const username = "prettypaintingsandskys";
scrapePinterestWithScroll(
  // "https://www.pinterest.com/prettypaintingsandskys/_created"
  `https://www.pinterest.com/${username}/_created`
);
