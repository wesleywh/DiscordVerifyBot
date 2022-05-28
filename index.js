const Discord = require("discord.js")
const Database = require("@replit/database")
const keepAlive = require("./server")
const c_help = require("./commands/help")
const c_links = require("./commands/links")
const c_versions = require("./commands/versions")
const c_issues = require("./commands/issues")
const c_verify = require("./commands/verify")
const discord_member = require("./helpers/discord_member")

const db = new Database()
const client = new Discord.Client({ 
    intents: [
      "GUILDS",
      "GUILD_MESSAGES",
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_REACTIONS",
      "DIRECT_MESSAGE_TYPING"
    ],
    partials: [
      "CHANNEL"
    ]
})

// STARTUP
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

// MESSAGE ACTIONS
client.on('message', async (msg) => {
  if (msg.author.bot) return

  try {
    let isAdmin = await discord_member.GetMessageMemberIsAdminRole(client, msg);
    let isVerified = await discord_member.GetMessageMemberIsVerifiedRole(client, msg);
    if (msg.channel.type === "DM")
    {
      if (isAdmin)
      {
        if (msg.content.startsWith("$remove_verify_key")) {
          c_verify.RemoveVerifiedPurchaserByKey(db, msg);
        }
        else if (msg.content.startsWith("$remove_verify_name")) {
          c_verify.RemoveVerifiedPurchaserByName(db, msg);
        }
        else if (msg.content.startsWith("$remove_verify")) {
          msg.channel.send("Did you mean `$remove_verify_name` or `$remove_verify_key`?");
        }
        else if (msg.content.startsWith("$purge_verify")) {
          c_verify.PurgeVerifyDB(db, msg);
        }
        else if (msg.content.startsWith("$get_verify_key")) {
          c_verify.GetVerifiedPurchaserByKey(db, msg);
        }
        else if (msg.content.startsWith("$get_verify_name")) {
          c_verify.GetVerifiedPurchaserByName(db, msg);
        }
        else if (msg.content.startsWith("$get_verify")) {
          msg.channel.send("Did you mean `$get_verify_key` or `$get_verify_name`?");
        }
        else if (msg.content.startsWith("$reset_verify_attempts")) {
          c_verify.ResetVerifyAttempts(db, msg);
        }
        else if (msg.content.startsWith("$purge_attempts")) {
          c_verify.PurgeAttemptsDB(db, msg);
        }
        else if (msg.content.startsWith("$verify")) {
          let member = await discord_member.GetMessageMember(client, msg)
          c_verify.Verify(db, msg, isAdmin, member);
        }
      }
    }
    if (isVerified)
    {
      // Additional commands here
    }
    else
    {
      if (msg.content.startsWith("$verify")) {
        let member = await discord_member.GetMessageMember(client, msg)
        c_verify.Verify(db, msg, isAdmin, member);
      }
    }
  }
  catch (e) {
    console.log(e);
  }
})

keepAlive()
console.log("Attempting to login.")
// client.Log += (msg) => {console.log(msg.ToString());}
client.login(process.env.TOKEN).catch(console.error)