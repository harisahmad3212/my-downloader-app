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
      // Kuch aur zaroori flags
      skipDownload: true,
      restrictFilenames: true,
    });

    // Sirf MP4 formats nikalo
    const formats = result.formats.filter(f => f.vcodec !== 'none' && f.acodec !== 'none' && f.ext === 'mp4' && f.url);

    // Sab se behtar audio format nikalo
    const audioFormat = result.formats
      .filter(f => f.vcodec === 'none' && f.acodec !== 'none' && f.url)
      .sort((a, b) => b.abr - a.abr)[0];

    return {
      statusCode: 200,
      body: JSON.stringify({
        title: result.title,
        thumbnail: result.thumbnail,
        formats: formats,
        audioFormat: audioFormat,
      }),
    };
  } catch (error) {
    // Terminal mein error dikhao taake masla pata chalay
    console.error("--- YT-DLP EXEC ERROR ---", error); 
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process video. Check the server logs in your terminal.' }),
    };
  }
};
