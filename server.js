// server.js
const express = require("express");
const scrapePinterestProfile = require("./scraper");
const scrapePinterestPost = require("./findpost");

const app = express();
const port = 3000;

app.use(express.static("public")); // Serve static HTML file

app.get("/api/user/:username", async (req, res) => {
  const username = req.params.username;
  console.log(`Fetching data for user: ${username}`); // Log the username

  try {
    const data = await scrapePinterestProfile(username);
    console.log(data); // Log the data
    res.json(data);
  } catch (error) {
    console.error(error); // Log errors if any
    res.status(500).json({ error: "Failed to scrape Pinterest profile." });
  }
});

// Serve the scraped data as JSON, accept URL dynamically
app.get("/scrape", async (req, res) => {
  const postUrl = req.query.url; // URL passed as query parameter

  if (!postUrl) {
    return res.status(400).send("No URL provided");
  }

  const postData = await scrapePinterestPost(postUrl);
  if (postData) {
    res.json(postData);
  } else {
    res.status(500).send("Failed to scrape post data");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
