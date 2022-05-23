const verified_db = require("./verified_db")
const https = require("https");
const failed_verify_msg = "Failed to verify with provided invoice number."
const success_verify_msg = `Congratulations, you have been successfully verified. If you don't see all the channels now contact @${process.env.SUPPORT_CONTACT}`

module.exports = {
    VerifyInvoiceNumber: async function(msg, db, invoice_number, member) {
        const options = {
            hostname: 'api.assetstore.unity3d.com',
            port: 443,
            path: `/publisher/v1/invoice/verify.json?key=${process.env.UNITY_PUBLISHER_API_KEY}&invoice=${invoice_number}`,
            method: 'GET',
        };
        const req = https.request(options, res => {
            var str='';

            res.on('data', function(chunk){
                str+=chunk;
            });

            res.on('end', async function(){
                data = JSON.parse(str)
                if (data["invoices"].length > 0 && data["invoices"][0]["package"].includes(process.env.UNITY_PRODUCT_NAME))
                {
                    if (data["invoices"][0]["package"].includes("Demo"))
                    {
                        // Attempted to verify a demo invoice
                        msg.channel.send("Really? Did you seriously just try and validate a demo package to get full access?.... Really?...");
                        return false;
                    }
                    else 
                    {
                        // check if this key is already used by someone else
                        let keyUsed = await verified_db.KeyAlreadyUsed(db, invoice_number);
                        if (!keyUsed)
                        {
                            // key is not used anywhere, add them to the database
                            await verified_db.AddVerfiedPurchaser(db, invoice_number, msg.author.username);
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
                                msg.channel.send(`You have been locked out. Contact @${process.env.SUPPORT_CONTACT} for support.`);
                            return false;
                        }
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
                        msg.channel.send(`You have been locked out. Contact @${process.env.SUPPORT_CONTACT} for support.`);
                    return false;
                }
            });
        });
        req.end();
    }
}