require("./setting.js");
require("./lib/myfunction.js");
const {
    default: makeWASocket,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    DisconnectReason,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    fetchLatestBaileysVersion, 
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    extractMessageContent, 
    jidDecode,
    MessageRetryMap,
    jidNormalizedUser, 
    proto,
    getContentType,
    areJidsSameUser,
    generateWAMessage, 
    delay, 
    Browsers
} = require("@skyzopedia/baileys-mod");
const readline = require("readline");
const pino = require("pino");
const fs = require("fs");
const serialize = require("./lib/serialize.js");
const FileType = require("file-type");
global.groupMetadataCache = new Map();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version, 
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    browser: Browsers.ubuntu("Chrome"), 
    cachedGroupMetadata: async (jid) => {
        if (!global.groupMetadataCache.has(jid)) {
            const metadata = await sock.groupMetadata(jid).catch((err) => {});
            await global.groupMetadataCache.set(jid, metadata);
            return metadata;
        }
        return global.groupMetadataCache.get(jid);
    }
  });

if (!sock.authState.creds.registered) {
  console.clear();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  rl.question("\nMasukkan nomor WhatsApp kamu (tanpa +):\n", async (number) => {
    setTimeout(async () => {
      const code = await sock.requestPairingCode(number, 'LUXXXXXX');
      console.log(`\n🔗 Kode Pairing: ${code}`);
      rl.close();
    }, 5000);
  });
}

  sock.ev.on("creds.update", await saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) startBot();
      else console.log("Device Logged out, hapus folder /session untuk login ulang.");
    } else if (connection === "open") {
    (async () => {
        await global.dtbase(sock).catch(() => {});
    })();
    console.log(sock.user)
    botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    console.log("Bot berhasil terhubung!");
}
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return
    let m = await serialize(sock, msg)
    require("./XskyLuxx.js")(sock, m)
  });
  
  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {};
        return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
    }
    return jid;
 };
  
  sock.downloadMediaMessage = async (m, type, filename = "") => {
    if (!m || !(m.url || m.directPath)) return Buffer.alloc(0);
    const stream = await downloadContentFromMessage(m, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    if (filename) await fs.promises.writeFile(filename, buffer);
    return filename && fs.existsSync(filename) ? filename : buffer;
 };
 
 sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    const quoted = message.msg ? message.msg : message;
    const mime = (message.msg || message).mimetype || "";
    const messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
    const fil = Date.now();
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    const type = await FileType.fromBuffer(buffer);
    const trueFileName = attachExtension ? `./lib/sampah/${fil}.${type.ext}` : filename;
    fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
 };
 
 return sock
}

startBot();