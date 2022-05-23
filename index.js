const Discord = require("discord.js")           // The discord api to send and receive messages from users
const Database = require("@replit/database")    // The replit database to interact with (lockouts and verified)
const keepAlive = require("./server")           // The server to keep the replit alive after closing the tab
const c_verify = require("./commands/verify")   // The list of verify commands a user can request
const discord_member = require("./helpers/discord_member")  // Helper script to identify roles (even in DM's)

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
        c_verify.Verify(db, msg, isAdmin);
      }
    }
  }
  if (isVerified)
  {
    // ADDITIONAL COMMANDS CAN GO HERE IF THE USER HAS BEEN VERIFIED
  }
  else
  {
    // If the user requests the $verify api endpoint
    // attempt to verify their key and assign the role
    if (msg.content.startsWith("$verify")) {
      c_verify.Verify(db, msg, isAdmin);
    }
  }
})

keepAlive()
console.log("Attempting to login.")
// client.Log += (msg) => {console.log(msg.ToString());}
client.login(process.env.TOKEN).catch(console.error)