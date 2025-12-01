const chalk = require("chalk");
const fs = require("fs");
const util = require("util");
const os = require('os');
const { exec, spawn, execSync } = require('child_process');
const { prepareWAMessageMedia, generateWAMessageFromContent } = require("@skyzopedia/baileys-mod");
const antilink = JSON.parse(fs.readFileSync('./lib/antilink.json'))

//==================================//

module.exports = async (sock, m) => {
try {
const isCmd = m?.body?.startsWith(m.prefix)
const quoted = m.quoted ? m.quoted : m
const mime = quoted?.msg?.mimetype || quoted?.mimetype || null
const args = m?.body?.trim().split(/ +/).slice(1)
const qmsg = (m.quoted || m)
const text = q = args.join(" ")
const command = isCmd ? m.body.slice(m.prefix.length).trim().split(' ').shift().toLowerCase() : ''
const cmd = m.prefix + command
const botNumber = await sock.user.id.split(":")[0]+"@s.whatsapp.net"
const botLid = await sock.user.lid.split(":")[0]+"@lid"
const ownerLid = await sock.toLid(global.owner+"@s.whatsapp.net")
const isOwner = ownerLid == m.sender || m.sender == botLid
  m.isGroup = m.chat.endsWith('g.us');
  m.metadata = {};
  m.isAdmin = false;
  m.isBotAdmin = false;
  if (m.isGroup) {
    let meta = await global.groupMetadataCache.get(m.chat)
    if (!meta) meta = await sock.groupMetadata(m.chat).catch(_ => {})
    m.metadata = meta;
    const p = meta?.participants || [];
    m.isAdmin = p?.some(i => (i.id === m.sender || i.jid === m.sender) && i.admin !== null);
    m.isBotAdmin = p?.some(i => (i.id === botLid || i.jid == botNumber) && i.admin !== null);
  } 
  
if (m.isGroup && antilink.includes(m.chat) && m.isBotAdmin) {
    if (!m.isAdmin && !isOwner && !m.fromMe) {
        let link = /chat\.whatsapp\.com/gi
        if (link.test(m.text)) {
            let gclink = "https://chat.whatsapp.com/" + await sock.groupInviteCode(m.chat)
            let isLinkThisGc = new RegExp(gclink, "i")
            if (isLinkThisGc.test(m.text)) return

            let delet = m.key.participant
            let bang = m.key.id

            await sock.sendMessage(m.chat, {
                delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }
            })
        }
    }
}

const qpush = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast"
  },
  message: {
    locationMessage: {
      name: "POWERED BY LUXXX",
      jpegThumbnail: Buffer.from([]),
      degreesLatitude: 0,
      degreesLongitude: 0,
      address: " ",
      url: " "
    }
  }
}

//==================================//

const c = chalk;
if (pesanTeks) {
  const isPrivate = !m.isGroup;

  console.log(
    c.yellow("┌────────────── PESAN MASUK ──────────────") +
    "\n" + c.white("│ Dari     : ") + c.cyan(m.sender) +
    (isPrivate
      ? "\n" + c.white("│ Ke       : ") + c.magenta(m.chat) 
      : "\n" + c.white("│ Group    : ") + c.green(m.metadata.subject)
    ) +
    "\n" + c.white("│ Isi      : ") + c.blue(pesanTeks) +
    "\n" + c.yellow("└──────────────────────────────────────────\n")
  );
}

//==================================//

switch (command) {
case "menu": {
let teks = `Hii @${m.sender.split("@")[0]} 🕊️ I'm Simple Bot Pushkontak — By XskyLuxx

\`❏ All Menu\`
- .pushkontak
- .jpm
- .jpmch
- .setjeda
- .antilink
- .payment
- .done
`;
  const msg = generateWAMessageFromContent(m.chat, {
    interactiveMessage: {
      header: {
        ...(await prepareWAMessageMedia(
          { image: { url: global.thumbnail } },
          { upload: sock.waUploadToServer }
        )),
        hasMediaAttachment: true
      },

      body: { text: teks },

      nativeFlowMessage: {
        buttons: [
            {
            buttonId: `.owner`,
            buttonText: { displayText: 'Contact Owner' },
            type: 1
            },
            {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "Channel Developer",
              url: "https://whatsapp.com/channel/0029VbBFghDDZ4LRcUkPEs18"
            })
          }
        ]
      },

      contextInfo: { mentionedJid: [m.sender] }
    }
  }, {});
  await sock.relayMessage(
    m.chat,
    msg.message,
    { messageId: msg.key.id }
  );
}
break;


case "developerbot":
case "owner": {
  await sock.sendContact(m.chat, [global.owner], "Luxxx Shtr", m)
  break
}

case "payment":
case "pay": {
  let teks = `Berikut Daftar Payment *XskyLuxx*
  
  *- Dana* : 0882003061918
  *- Qris* : Scan Foto Diatas
  
[ ! ] \`\`\`Wajib kirimkan bukti transfer demi keamanan bersama\`\`\``;
  const msg = generateWAMessageFromContent(m.chat, {
    interactiveMessage: {
      header: {
        ...(await prepareWAMessageMedia(
          { image: { url: global.qris } },
          { upload: sock.waUploadToServer }
        )),
        hasMediaAttachment: true
      },

      body: { text: teks },

      nativeFlowMessage: {
        buttons: [
            {
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                display_text: 'Dana',
                copy_code: global.dana
              })
            }
        ]
      },

      contextInfo: { mentionedJid: [m.sender] }
    }
  }, {});
  await sock.relayMessage(
    m.chat,
    msg.message,
    { messageId: msg.key.id }
  );
}
break;
//==================================//

case "jpmch":
case "jasherch":
case "jaserch": {
  if (!isOwner) return m.reply("Khusus Owner!");
  if (!text) return m.reply(`*Contoh:* ${cmd} pesannya & bisa dengan foto juga`);

  let qmsg = m.quoted ? m.quoted : m;
  let mime = (qmsg.msg || qmsg).mimetype || "";
  let mediaPath, messageContent;

  if (/image/.test(mime)) {
    mediaPath = await sock.downloadAndSaveMediaMessage(qmsg);
  }

  const all = await sock.groupFetchAllParticipating();
  const channels = Object.values(all).filter(v => v.id.endsWith("@channel"));

  if (!channels.length) return m.reply("Bot tidak join channel manapun.");

  let success = 0;

  const baseMsg = { extendedTextMessage: { text } };
  messageContent = await generateWAMessageFromContent(
    m.sender,
    baseMsg,
    { userJid: m.sender, quoted: m }
  );

  if (mediaPath) {
    const img = await prepareWAMessageMedia(
      { image: await fs.readFileSync(mediaPath) },
      { upload: sock.waUploadToServer }
    );
    img.imageMessage.caption = text;
    messageContent = await generateWAMessageFromContent(
      m.sender,
      { ...img },
      { userJid: m.sender, quoted: null }
    );
  }

  global.messageJpm = messageContent;
  global.statusjpm = true;

  await m.reply(`🚀 *Memproses JPM CHANNEL ${mediaPath ? "Teks + Foto" : "Teks"}*
- Total Channel: ${channels.length}
- Delay: ${global.Delay / 1000} detik`);

  for (const ch of channels) {
    if (global.stopjpm) {
      delete global.stopjpm;
      delete global.statusjpm;
      break;
    }

    try {
      await sock.relayMessage(ch.id, global.messageJpm.message, {
        messageId: global.messageJpm.key.id
      });
      success++;
    } catch (e) {
      console.error(`Gagal kirim ke channel ${ch.id}:`, e);
    }

    await sleep(global.Delay);
  }

  if (mediaPath) fs.unlinkSync(mediaPath);

  await sock.sendMessage(
    m.chat,
    { text: `✅ *JPM CHANNEL ${mediaPath ? "Teks + Foto" : "Teks"} berhasil dikirim ke ${success} channel!*` },
    { quoted: m }
  );
}
break;


case 'pushkontak': {
  if (!text.includes('|')) 
    return m.reply('contoh :\n.pushkontak <idgrup>|<pesan>\n\n> ketik .idgc untuk cek id')

  if (!isOwner) return m.reply("khusus owner")

  const [idgc, pesan] = text.split('|').map(v => v.trim())
  if (!idgc || !pesan) return m.reply("Format salah!")

  let metadata
  try {
    metadata = await sock.groupMetadata(idgc)
  } catch {
    return m.reply("ID grup tidak valid / bot bukan member!")
  }

  const participants = metadata.participants
  const totalMember = participants.length
  const groupName = metadata.subject

  let success = 0, failed = 0

  m.reply(
    `Proses mengirim pesan...\n` +
    `Grup: *${groupName}*\n` +
    `Member: *${totalMember}*`
  )

  for (const user of participants) {
    try {
      await sock.sendMessage(user.id, { text: pesan }, { quoted: qpush })
      success++
    } catch {
      failed++
    }
    await sleep(global.Delay)
  }

  // selesai
  m.reply(
    `Selesai!\n` +
    `Grup: *${groupName}*\n` +
    `Total member: *${totalMember}*\n\n` +
    `Berhasil: ${success}\nGagal: ${failed}`
  )
}
break

case "idgc": {
  const groups = await sock.groupFetchAllParticipating()
  const list = Object.keys(groups)

  if (!list.length) return m.reply("Bot tidak ada di grup mana pun.")

  let teks = "*Daftar ID Grup*\n\n"
  for (let id of list) {
    const name = groups[id].subject || "Tanpa Nama"
    teks += `• *${name}*\n  ${id}\n`
  }

  m.reply(teks)
}
break
//==================================//

case "jasher":
case "jpm":
case "jaser": {
  if (!isOwner) return m.reply("Khusus Owner!");
  if (!text) return m.reply(`*Contoh:* ${cmd} pesannya & bisa dengan foto juga`);
  let mediaPath, messageContent;
  if (/image/.test(mime)) mediaPath = await sock.downloadAndSaveMediaMessage(qmsg);
  const allGroups = await sock.groupFetchAllParticipating();
  const groupIds = Object.keys(allGroups);
  let successCount = 0;
  const baseMsg = { extendedTextMessage: { text } };
  messageContent = await generateWAMessageFromContent(m.sender, baseMsg, { userJid: m.sender, quoted: m });
  if (mediaPath) {
    const img = await prepareWAMessageMedia({ image: await fs.readFileSync(mediaPath) }, { upload: sock.waUploadToServer });
    img.imageMessage.caption = text;
    messageContent = await generateWAMessageFromContent(m.sender, { ...img }, { userJid: m.sender, quoted: null });
  }
  global.messageJpm = messageContent;
  global.statusjpm = true;
  await m.reply(`🚀 *Memproses ${mediaPath ? "Jpm Teks & Foto" : "Jpm Teks"}*
- Total Grup: ${groupIds.length}
- Jeda: 4 detik`);
  for (const id of groupIds) {
    if (global.stopjpm) { delete global.stopjpm; delete global.statusjpm; break; }
    try {
      await sock.relayMessage(id, global.messageJpm.message, { messageId: global.messageJpm.key.id });
      successCount++;
    } catch (e) { console.error(`Gagal kirim ke grup ${id}:`, e); }
    await sleep(global.Delay);
  }
  if (mediaPath) fs.unlinkSync(mediaPath);
  await sock.sendMessage(m.chat, {
    text: `✅ *Jpm ${mediaPath ? "Teks & Foto" : "Teks"} berhasil dikirim ke ${successCount} grup!*`
  }, { quoted: m });
}
break;

case "done":
case "don":
case "proses":
case "ps": {    
if (!isOwner) return m.reply("lu sok asik")
if (!text) return m.reply("Contoh Penggunaan: \n\nPanel Unlimited,2") 
const [barang, harga] = text.split(",") 
if (isNaN(harga)) return m.reply("Format Harga Tidak Valid")
var total = `${harga}000000`
var total2 = Number(`${harga}000`)
const status = /done|don/.test(command) ? "TRANSAKSI BERHASIL ✅" : "DANA MASUK ✅*\n*WAIT KAMI PROSES DULU";
    const teks = `
*${status}* 
━━━━━━━━━━━━━━━━━━
📦 *Barang:* ${barang}
💰 *Harga:*  ${toRupiah(total2)}
🗓️ *Tanggal:* ${global.tanggal(Date.now())}
━━━━━━━━━━━━━━━━━━
*LUXX  MENYEDIAKAN:*
- Open seller/adp/pt/own panel
- Mursun , Murnok , Mur rename
- Jasa rename , jasa suntik
- Nokos All region
wa.me/${global.owner}
`;
    await sock.sendMessage(m.chat, {
        text: teks,
        contextInfo: {
        }
    }, { quoted: m });
}
break

case "antilink": {
    if (!m.isGroup) return m.reply("Perintah ini khusus Group")
    if (!isOwner && !isAdmin) return m.reply("lu admin?")
    if (!args[0]) return m.reply("Contoh Penggunaan:\n\n .Antilink on/off>")

    if (/on/i.test(args[0])) {
        if (antilink.includes(m.chat))
            return m.reply("*Antilink* sudah aktif!")

        antilink.push(m.chat)
        fs.writeFileSync("./lib/antilink.json", JSON.stringify(antilink))
        m.reply("Antilink berhasil diaktifkan ✅")

    } else if (/off/i.test(args[0])) {
        if (!antilink.includes(m.chat))
            return m.reply("*Antilink* belum aktif!")

        let pos = antilink.indexOf(m.chat)
        antilink.splice(pos, 1)
        fs.writeFileSync("./lib/antilink.json", JSON.stringify(antilink))
        m.reply("Antilink berhasil dimatikan ❌")

    } else {
        return m.reply(example("on/off"))
    }
}
break

//==================================//

default:

//==================================//

}} catch (err) {
console.log(err)
}
}

let file = require.resolve(__filename) 
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.white("[•] Update"), chalk.white(`${__filename}\n`))
delete require.cache[file]
require(file)
})