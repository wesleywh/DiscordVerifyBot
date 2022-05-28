const gumroad = require("../publisher_api/gumroad")
const unity = require("../publisher_api/unity")
const verifydb = require("../publisher_api/verified_db")

module.exports = {
    Verify: async function (db, msg, isAdmin, member)
    {
        let isLocked = false;
        isLocked = await verifydb.GetUserIsLocked(db, msg.author.username);
        if (isLocked)
        {
            msg.channel.send(`You have exceed your maximum attempts and are locked out. Contact ${process.env.SUPPORT_CONTACT} for support`);
        }
        else 
        {
            // not locked out continue...
            const key = msg.content.split("$verify ")[1].trim()
            if (key.startsWith("IN"))
            {
                // is probably a unity invoice number
                unity.VerifyInvoiceNumber(msg, db, key, member);
            }
            else 
            {
                // most likely a gumroad license key
                gumroad.VerifyLicenseKey(msg, db, key, member);
            }
        }
    },
    RemoveVerifiedPurchaserByKey: async function (db, msg) 
    {
        const key = msg.content.split("$remove_verify_key ")[1].trim()
        if (key != null)
        {
          let removed_value = await verifydb.RemoveVerifiedPurchaserByKey(db, key)
          if (removed_value != null)
            msg.channel.send("Successfully removed verified purchaser");
          else 
            msg.channel.send("Failed to removed verified purchaser");
        }
    },
    RemoveVerifiedPurchaserByName: async function (db, msg) 
    {
        const username = msg.content.split("$remove_verify_name ")[1].trim()
        if (username != null)
        {
          let removed_value = await verifydb.RemoveVerifiedPurchaserByKey(db, username)
          if (removed_value != null)
            msg.channel.send("Successfully removed verified purchaser");
          else 
            msg.channel.send("Failed to removed verified purchaser");
        }
    },
    PurgeVerifyDB: async function(db, msg) 
    {
        verifydb.PurgeDB(db);
        msg.channel.send("Purged the verify database.");
    },
    PurgeAttemptsDB: async function(db, msg) 
    {
        verifydb.PurgeAttemptsDB(db);
        msg.channel.send("Purged the attempts database.");
    },
    GetVerifiedPurchaserByKey: async function(db, msg) 
    {
        const key = msg.content.split("$get_verify_key ")[1].trim()
        if (key != null)
        {
          let purchaser = await verifydb.GetVerifiedPurchaserByKey(db, key);
          msg.channel.send(purchaser);
        }
    },
    GetVerifiedPurchaserByName: async function(db, msg) 
    {
        const username = msg.content.split("$get_verify_name ")[1].trim()
        if (username != null)
        {
          let purchaser = await verifydb.GetVerifiedPurchaserByName(db, username);
          msg.channel.send(purchaser);
        }
    },
    ResetVerifyAttempts: async function(db, msg) 
    {
        const username = msg.content.split("$reset_verify_attempts ")[1].trim()
        if (username != null)
        {
          await verifydb.SetVerifyAttempt(db, username, 0);
          msg.channel.send(`Set verify attempts to 0 for ${username}`);
        }
    }
}