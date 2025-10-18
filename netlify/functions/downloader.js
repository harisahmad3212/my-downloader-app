const youtubedl = require('yt-dlp-exec');

exports.handler = async (event, context) => {
  const videoUrl = event.queryStringParameters.url;

  if (!videoUrl) {
    return { statusCode: 400, body: JSON.stringify({ error: 'URL is required' }) };
  }

  try {
    const result = await youtubedl(videoUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
    });

    const bestFormat = result.formats
      .filter(f => f.vcodec !== 'none' && f.acodec !== 'none' && f.url)
      .sort((a, b) => b.height - a.height)[0];

    if (!bestFormat) {
      throw new Error("No suitable video format found.");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        downloadUrl: bestFormat.url,
        title: result.title,
        ext: bestFormat.ext
      }),
    };

  } catch (error) {
    console.error("--- YT-DLP EXEC ERROR ---", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get download link. Check server logs.' }),
    };
  }
};
