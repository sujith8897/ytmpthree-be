const express = require("express");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

const app = express();
const port = 8000;

app.use(express.json());

app.post("/download", (req, res) => {
  const url = req?.query?.url;
  const format = req?.query?.format;

  if (!url) {
    return res.send("Please provide a YouTube URL");
  }

  try {
    if (format === "mp3") {
      ytdl
        .getBasicInfo(url)
        .then(() => {
          const audioStream = ytdl(url, {
            quality: "highestaudio",
            format: "audioonly",
          });

          res.header("Content-Disposition", 'attachment; filename="audio.mp3"');

          ffmpeg()
            .input(audioStream)
            .format("mp3")
            .audioCodec("libmp3lame")
            .on("error", (err) => {
              console.error("An error occurred: " + err.message);
              res.sendStatus(500);
            })
            .on("end", () => {
              console.log("Conversion finished");
            })
            .pipe(res, { end: true });
        })
        .catch((err) => {
          res.status(400).send({ error: "Invalid YouTube URL" });
        });
    } else if (format === "mp4") {
      ytdl
        .getBasicInfo(url)
        .then(() => {
          const videoStream = ytdl(url, {
            quality: "highest",
          });

          res.header("Content-Disposition", 'attachment; filename="video.mp4"');
          videoStream.pipe(res);
        })
        .catch((err) => {
          res.status(400).send({ error: "Invalid YouTube URL" });
        });
    } else {
      return res.status(400).send({ error: "Unsupported format" });
    }
  } catch (err) {
    console.log({ err });
    res.status(500).send({ error: "Something Failed!" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
