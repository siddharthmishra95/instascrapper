const puppeteer = require("puppeteer");

async function scrapePinterestProfile(username) {
  const url = `https://www.pinterest.com/${username}/`;

  console.time("Scraping Time");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();

  // Disable images, stylesheets, and fonts to speed up scraping
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const resourceType = request.resourceType();
    if (
      resourceType === "image" ||
      resourceType === "stylesheet" ||
      resourceType === "font"
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });

  try {
    // Wait for elements in parallel
    await Promise.all([
      page.waitForSelector('[data-test-id="profile-name"]'),
      page.waitForSelector('[data-test-id="profile-followers-link"]'),
      page.waitForSelector('[data-test-id="follower-count"]'),
    ]);

    // Scrape followers, following, and badge info
    const data = await page.evaluate(() => {
      const ProfileNameElement = document.querySelector(
        '[data-test-id="profile-name"]'
      );
      const followersElement = document.querySelector(
        '[data-test-id="profile-followers-link"]'
      );
      const followingElement = document.querySelector(
        '[data-test-id="follower-count"]'
      );
      const badgeElement = document.querySelector(
        '[data-test-id="verifiedMerchantBadge"]'
      );
      const badgePinnerElement = document.querySelector(
        '[data-test-id="verifiedPinnerBadge"]'
      );

      const ProfileName = ProfileNameElement
        ? ProfileNameElement.innerText
        : "N/A";
      const followers = followersElement ? followersElement.innerText : "N/A";
      const following = followingElement ? followingElement.innerText : "N/A";
      const badge = badgeElement
        ? "Verified Merchant Badge Present"
        : "No Badge";
      const Pinnerbadge = badgePinnerElement
        ? "Verified Pinner Badge Present"
        : "No Badge";

      return { ProfileName, followers, following, badge, Pinnerbadge };
    });

    await browser.close();

    console.timeEnd("Scraping Time"); // Log the time taken
    return data;
  } catch (error) {
    console.error("Error scraping data:", error);
    await browser.close();
    throw new Error("Failed to scrape Pinterest profile.");
  }
}

module.exports = scrapePinterestProfile;
