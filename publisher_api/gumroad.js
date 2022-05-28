const verified_db = require("./verified_db")
const https = require("https");
const failed_verify_msg = "Failed to verify with provided license key."
const success_verify_msg = `Congratulations, you have been successfully verified. If you don't see all the channels now contact ${process.env.SUPPORT_CONTACT}`

module.exports = {
    VerifyLicenseKey: async function(msg, db, key, member) {
        const options = {
            hostname: 'api.gumroad.com',
            port: 443,
            path: `/v2/licenses/verify?product_permalink=${process.env.GUMROAD_PRODUCT_PERMALINK}&license_key=${key}`,
            method: 'POST',
        };
        
        const req = https.request(options, res => {
            var str='';

            res.on('data',function(chunk){
                str+=chunk;
            });

            res.on('end', async function(){
                data = JSON.parse(str)
                if (data["success"] == true && data["purchase"]["product_name"] === process.env.GUMROAD_PRODUCT_NAME)
                {
                    // check if this key is already used by someone else
                    let keyUsed = await verified_db.KeyAlreadyUsed(db, key);
                    if (!keyUsed)
                    {
                        // key is not used, add this user and their key to the db
                        await verified_db.AddVerfiedPurchaser(db, msg.author.username, key);
                        var verified_role=member.guild.roles.cache.find(role => role.name === process.env.VERIFIED_ROLE_NAME);
                        member.roles.add(verified_role);
                        msg.channel.send(success_verify_msg);
                        return true;
                    }
                    else 
                    {
                        // Key already existed in the db, fail.
                        let remaining_attempts = await verified_db.AddVerifyAttempt(db, msg.author.username);
                        msg.channel.send(failed_verify_msg);
                        if (remaining_attempts > 0)
                            msg.channel.send(`You have ${remaining_attempts} attempts remaining before you are locked out.`);
                        else 
                            msg.channel.send(`You have been locked out. Contact ${process.env.SUPPORT_CONTACT} for support.`);
                        return false;
                    }
                }
                else 
                {
                    // Either the wrong product name or failed to process request.
                    let remaining_attempts = await verified_db.AddVerifyAttempt(db, msg.author.username);
                    msg.channel.send(failed_verify_msg);
                    if (remaining_attempts > 0)
                        msg.channel.send(`You have ${remaining_attempts} attempts remaining before you are locked out.`);
                    else 
                        msg.channel.send(`You have been locked out. Contact ${process.env.SUPPORT_CONTACT} for support.`);
                    return false;
                }
            });
        });
        req.end();
    }
}