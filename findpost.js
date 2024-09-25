const axios = require("axios");
const cheerio = require("cheerio");

// Scrape Pinterest post data
async function scrapePinterestPost(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Check if it's a video post
    const videoJsonLd = $('script[data-test-id="video-snippet"]').html();
    if (videoJsonLd) {
      const videoData = JSON.parse(videoJsonLd);

      // Extract video post details
      const postDetails = {
        headline: videoData.name || "No headline",
        videoUrl: videoData.contentUrl || null,
        thumbnail: videoData.thumbnailUrl || null,
        uploadDate: videoData.uploadDate || "Unknown",
        duration: videoData.duration || "Unknown",
        author: videoData.creator ? videoData.creator.name : "Unknown",
        authorProfile: videoData.creator ? videoData.creator.url : "Unknown",
        followers:
          videoData.creator &&
          videoData.creator.interactionStatistic &&
          videoData.creator.interactionStatistic[0]
            ? videoData.creator.interactionStatistic[0].InteractionCount
            : 0,
        description: videoData.description || "No description",
        commentCount: videoData.commentCount || 0,
      };

      // Log the post details as JSON in the console
      console.log(JSON.stringify(postDetails, null, 2));
      return postDetails;
    }

    // Check for standard post if no video snippet
    const postJsonLd = $('script[data-test-id="leaf-snippet"]').html();
    if (postJsonLd) {
      const postData = JSON.parse(postJsonLd);

      // Extract standard post details
      const postDetails = {
        headline: postData.headline || "No headline",
        imageUrl: postData.image || null,
        datePublished: postData.datePublished || "Unknown",
        author: postData.author ? postData.author.name : "Unknown",
        authorProfile: postData.author ? postData.author.url : "Unknown",
        description: postData.articleBody || "No description",
      };

      // Log the post details as JSON in the console
      console.log(JSON.stringify(postDetails, null, 2));
      return postDetails;
    }

    throw new Error("Post data not found");
  } catch (error) {
    console.error("Error scraping Pinterest post:", error);
    return null;
  }
}

// Example usage
module.exports = scrapePinterestPost;
