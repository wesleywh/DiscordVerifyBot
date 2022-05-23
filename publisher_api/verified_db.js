// This is used to manipulate the database only. If you want to 
// do more things like modify user permissions then you need to
// take advantage of the returned values from each function.

const db_name = "emi_verified_purchasers"   // the name of the db that keeps the verified discord users and their keys
const db_attempts = "emi_verified_attempts" // the name of the db that keeps the number of attempts the user has made to login
const lockout_attempts = 10;                // number of attempts that can be made before the user is locked out

module.exports = {
    PurgeDB: async function (db) {
        db.set(db_name, ["No Purchasers Verified"])
        return true;
    },
    RemoveVerifiedPurchaserByKey: async function (db, license) {
        let key = license.trim()
        let purchasers = await this.GetVerifiedPurchasers(db)
        if (purchasers == "No Purchasers Verified")
        {
            return false
        }
        else 
        {
            let pop_key = -1
            let removed_value = null
            for (var i = 0; i < purchasers.length; i++)
            {
                if (purchasers[i]["verified_key"] === key)
                {
                    pop_key = i;
                    break;
                }
            }
            if (pop_key > -1)
            {
                removed_value = purchasers[pop_key];
                purchasers.splice(pop_key, 1);
                db.set(db_name, purchasers);
            }
            return removed_value;
        }
    },
    RemoveVerifiedPurchaserByName: async function (db, discord_username) {
        let username = discord_username.trim().toLowerCase()
        let purchasers = await this.GetVerifiedPurchasers(db)
        if (purchasers == "No Purchasers Verified")
        {
            return false
        }
        else 
        {
            let pop_key = -1
            let removed_value = null
            for (var i = 0; i < purchasers.length; i++)
            {
                if (purchasers[i]["discord_username"].toLowerCase() === username)
                {
                    pop_key = i;
                    break;
                }
            }
            if (pop_key > -1)
            {
                removed_value = purchasers[pop_key];
                purchasers.splice(pop_key, 1);
                db.set(db_name, purchasers);
            }
            return removed_value;
        }
    },
    KeyAlreadyUsed: async function (db, license) {
        let key = license.trim()
        let purchasers = await this.GetVerifiedPurchasers(db)
        if (purchasers == "No Purchasers Verified")
        {
            return false
        }
        else 
        {
            return purchasers.some(function(item) {
                return Object.values(item).includes(key);
            });
        }
    },
    AddVerfiedPurchaser: async function (db, discord_username, license) {
        let key = license.trim()
        let purchasers = await this.GetVerifiedPurchasers(db)
        if (!purchasers.includes(discord_username))
        {
            if (purchasers == "No Purchasers Verified")
            {
                purchasers = []
            }
            purchasers.push({"discord_username": discord_username, "verified_key": key});
            db.set(db_name, purchasers)
            return {"discord_username": discord_username, "verified_key": key};
        }
        return null;
    },
    GetVerifiedPurchaserByKey: async function (db, license) {
        let key = license.trim()
        let verified_db = await db.get(db_name)
        if (!verified_db || verified_db == "" || verified_db == null || verified_db == undefined)
        {
            return "No Purchasers Verified"
        }
        else 
        {
            for (var i = 0; i < verified_db.length; i++)
            {
                if (verified_db[i]["verified_key"] === key)
                {
                    return JSON.stringify(verified_db[i])
                }
            }
            return "Not found.";
        }
    },
    GetVerifiedPurchaserByName: async function (db, discord_username) {
        let username = discord_username.trim().toLowerCase()
        let verified_db = await db.get(db_name)
        if (!verified_db || verified_db == "" || verified_db == null || verified_db == undefined)
        {
            return "No Purchasers Verified"
        }
        else 
        {
            for (var i = 0; i < verified_db.length; i++)
            {
                if (verified_db[i]["discord_username"].toLowerCase() === username)
                {
                    return JSON.stringify(verified_db[i])
                }
            }
            return "Not found.";
        }
    },
    GetVerifiedPurchasers: async function (db) {
        let verified_db = await db.get(db_name)
        if (!verified_db || verified_db == "" || verified_db == null || verified_db == undefined)
        {
            db.set(db_name, ["No Purchasers Verified"]).then(verified_db => {})
            return "No Purchasers Verified"
        }
        else 
        {
            return verified_db;
        }
    },
    GetVerifyAttemptsDB: async function(db) {
        let attempts_db = await db.get(db_attempts)
        if (!attempts_db || attempts_db == "" || attempts_db == null || attempts_db == undefined)
        {
            return [];
        }
        else 
        {
            return attempts_db;
        }
    },
    GetUserVerifyAttempts: async function(db, discord_username) {
        let attempts_db = await db.get(db_attempts)
        if (!attempts_db || attempts_db == "" || attempts_db == null || attempts_db == undefined)
        {
            return 0;
        }
        else 
        {
            for (var i = 0; i < attempts_db.length; i++)
            {
                if (attempts_db[i]["discord_username"].toLowerCase() === discord_username.toLowerCase())
                {
                    return attempts_db[i]["attempts"];
                }
            }
            return 0
        }
    },
    PurgeAttemptsDB: async function (db) {
        db.set(db_attempts, []);
    },
    AddVerifyAttempt: async function(db, discord_username) {
        let attempts_db = await this.GetVerifyAttemptsDB(db);
        let found_index = -1;
        let attempts_remaining = lockout_attempts;
        if (attempts_db.length > 0)
        {
            for (var i = 0; i < attempts_db.length; i++)
            {
                if (attempts_db[i]["discord_username"].toLowerCase() === discord_username.toLowerCase())
                {
                    found_index = i;
                    attempts_remaining -= attempts_db[i]["attempts"] + 1;
                    attempts_db[i] = {"discord_username": attempts_db[i]["discord_username"], "attempts": attempts_db[i]["attempts"] + 1 };
                    break;
                }
            }
        }
        else
            attempts_db = []
        if (found_index === -1)
        {
            attempts_remaining = 9;
            attempts_db.push({"discord_username": discord_username, "attempts": 1 })
        }
        db.set(db_attempts, attempts_db);
        return attempts_remaining;
    },
    SetVerifyAttempt: async function(db, discord_username, amount) {
        let attempts_db = await this.GetVerifyAttemptsDB(db);
        let found_index = -1;
        let attempts = 0;
        for (var i = 0; i < attempts_db.length; i++)
        {
            if (attempts_db[i]["discord_username"].toLowerCase() === discord_username.toLowerCase())
            {
                found_index = i;
                break;
            }
        }
        if (found_index > -1)
        {
            attempts_db[found_index] = {"discord_username": attempts_db[i]["discord_username"], "attempts": amount };
            db.set(db_attempts, attempts_db);
        }
    },
    GetUserIsLocked: async function(db, discord_username) {
        let attempts = await this.GetUserVerifyAttempts(db, discord_username);
        return attempts >= lockout_attempts;
    },
    GetLockoutAttemptsNumber: function () 
    {
        return lockout_attempts;
    }
}