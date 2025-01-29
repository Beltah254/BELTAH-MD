const { keith } = require('../keizzah/keith');
const { facebook } = require('@mrnima/facebook-downloader');  

keith({
  nomCom: "facebook",
  aliases: ["fbdl2", "facebookdl2", "fb2"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Check if there is a Facebook URL in the arguments
  if (!arg[0]) {
    return repondre('Please insert a public Facebook video link!');
  }

  // Validate that the argument contains "https://"
  if (!arg[0].includes('https://')) {
    return repondre("That is not a valid Facebook link.");
  }

  try {
    // Download the Facebook video data
    const videoData = await facebook(arg[0]);

    // Prepare the message caption with video details
    const caption = `
     *𝐀𝐋𝐏𝐇𝐀 𝐌𝐃 𝐅𝐁 𝐃𝐋*
    |__________________________|
    |       *ᴅᴜʀᴀᴛɪᴏɴ*  
           ${videoData.result.duration}
    |_________________________
    | REPLY WITH BELOW NUMBERS
    |_________________________
    |____  *ғᴀᴄᴇʙᴏᴏᴋ ᴠᴅᴇᴏ ᴅʟ*  ____
    |-᳆  1 sᴅ ǫᴜᴀʟɪᴛʏ
    |-᳆  2 ʜᴅ ǫᴜᴀʟɪᴛʏ
    |_________________________
    |____  *ғᴀᴄᴇʙᴏᴏᴋ ᴀᴜᴅɪᴏ ᴅʟ*  ____
    |-᳆  3 ᴀᴜᴅɪᴏ
    |-᳆  4 ᴅᴏᴄᴜᴍᴇɴᴛ
    |-᳆  5 ᴘᴛᴛ(ᴠᴏɪᴄᴇ)
    |__________________________|
    `;

    // Send the image and caption with a reply
    const message = await zk.sendMessage(dest, {
      image: { url: videoData.result.thumbnail },
      caption: caption,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          title: `${conf.BOT} FB DL`,
          body: `Duration: ${videoData.result.duration}`,
          thumbnailUrl: videoData.result.thumbnail,
          sourceUrl: conf.GURL,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: ms });

    const messageId = message.key.id;

    // Event listener for reply messages
    zk.ev.on("messages.upsert", async (update) => {
      const messageContent = update.messages[0];
      if (!messageContent.message) return;

      // Get the response text (from the conversation or extended message)
      const responseText = messageContent.message.conversation || messageContent.message.extendedTextMessage?.text;

      // Check if the message is a reply to the initial message
      const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

      if (isReplyToMessage) {
        // React to the message
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Extract video details
        const videoDetails = videoData.result;

        // React with an upward arrow
        await zk.sendMessage(dest, {
          react: { text: '⬆️', key: messageContent.key },
        });

        // Send the requested media based on the user's response
        if (responseText === '1') {
          await zk.sendMessage(dest, {
            video: { url: videoDetails.links.SD },
            caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃*",
          }, { quoted: messageContent });
        } else if (responseText === '2') {
          await zk.sendMessage(dest, {
            video: { url: videoDetails.links.HD },
            caption: "*𝐀𝐋𝐏𝐇𝐀 𝐌𝐃*",
          }, { quoted: messageContent });
        } else if (responseText === '3') {
          await zk.sendMessage(dest, {
            audio: { url: videoDetails.links.SD },
            mimetype: "audio/mpeg",
          }, { quoted: messageContent });
        } else if (responseText === '4') {
          await zk.sendMessage(dest, {
            document: {
              url: videoDetails.links.SD
            },
            mimetype: "audio/mpeg",
            fileName: "Alpha.mp3",
            caption: "*ALPHA MD*"
          }, {
            quoted: messageContent
          });
        } else if (responseText === '5') {
          await zk.sendMessage(dest, {
            audio: {
              url: videoDetails.links.SD
            },
            mimetype: 'audio/mp4',
            ptt: true
          }, {
            quoted: messageContent
          });
        } else {
          // If the response is invalid, inform the user
          await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a valid number (1-5).",
            quoted: messageContent
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    repondre('An error occurred: ' + error.message);
  }
});
