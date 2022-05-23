# What Is This?
This is a discord bot built on Discord NodeJS `v13.4.0`. It will allow users to DM it to verify their unity invoice number or gumroad license key in order to "authenticate". If it successfully "authenticates" one of these keys they, the requesting discord user, will automatically be assigned the `VERIFIED_ROLE_NAME`. Setup your server so only the `VERIFIED_ROLE_NAME` will be able to see target discord channels.

This is designed to be run in a replit (https://replit.com/) in combination with a pinging robot to make sure the bot is always running via (https://uptimerobot.com). That means you essentially can perminantly host a discord bot for free, forever. I talk about how to setup your replit and the up-time robot down below.

This will have a running server that will be constantly pinged by the up-time robot to keep it alive.

# Why Is This Here?
This is a small extracted portion of the `CBBot` that I originally wrote for my `CyberBulletGames` discord server that had a lot of people asking for support but pirating my product (of course for "testing-purposes", uh-huh the classic lie they tell to themselves). This way I would only provide support via the support channels. The only way to get to that support channel was to authenticate with their unity invoice number or gumroad license key.

# Features
  * Can only attach one unity invoice or gumroad license key once per user for the entire server.
    - This means if another user tries to "authenticate" with the same invoice/gumroad key they will fail.
  * Prevents rotation guessing of invoices or license keys by only allowing 10 user inputs before locking them out
  * Full adimistrative support to manage database entries
  * Designed to run in a replit (https://replit.com/)
  * Takes advantage of persistant database available in replit's, so even if your bot dies your data will remain safe
  * Customizable via environment variables

# Setup
## Replit
This section will go over how to setup your replit.

  1. Setup a blank replit to run on NodeJS
  2. Upload all of the files in the repo (You can obviously modify any additional settings in the code you want)
  3. Go to `Packages` then install the following packages:
    - Node 17.7.2
    - @replit/database 2.0.2
    - discord.js 13.7.0
    - express 4.18.1
    - https 1.0.0
  4. Set secret environment variables (explained below)
  5. You're ready to manually test!
    - Note: You can make the replit perminant by using up-time robot explained below

### Needed Secret Environment Variables
You need to add the following secret environment variables to your replit

    - `TOKEN` - The discord API token so this bot can interact with the Discord API
    - `UNITY_PUBLISHER_API_KEY` - The API key you can get from the unity publisher page
    - `GUMROAD_PRODUCT_NAME` - The name of the product you want to verify
    - `UNITY_PRODUCT_NAME` - The name of the unity product you want to verify
    - `GUMROAD_PRODUCT_PERMALINK` - The permanent link to the product your checking against
    - `SERVER_ID` - The id of the server the bot will be adding permissions to for a target user
    - `VERIFIED_ROLE_NAME` - The name of the role to assign the user in the `SERVER_ID` when they successfully verify their key
    - `ADMIN_ROLE_NAME` - The name of the role that will signify this person is an admin
    - `SUPPORT_CONTACT` - The person that will be listed to @ if the requestor gets locked out

## Up-Time Robot
Normally when you close your replit's tab the bot will stop. Since the bot is running a server that is listening on a target port you can simply ping that port forever to keep it always running. That is the purpose of this setup.

Before we start setting up we need to go to our replit bot and start it. It will have a webbrowser page that shows up. In that page it will have a URL. Get this URL and save it for the setup below.

  1. Go To: https://uptimerobot.com/
  2. Register For Free
  3. Login
  4. Click `Add New Monitor`
    - Set monitor type to `HTTP(s)`
    - Set friendly name (I like to name it the same as my bot's name)
    - Set URL to the URL you got from your replit (explained above)
    - Monitoring Interval - 15 minutes
    - Monitor Timeout - 30 seconds
  5. Done!

With that you now have a free hosted perminantely up discord robot for free! 

# Code Explained
In the code there is a `commands` directory which will hold all of the commands that can be run. In this case I have sorted it down to only the `verify` commands. 

There is also the `helpers` directory which is a generic set of scripts that can be used by anything. It's not limited to this repo.

The `publisher_api` directory is the bulk of the logic for saving verified purchasers to the replit database, locking users that fail to verify, and the actual verification api calls for verifying license keys and invoice numbers.

The `index.js` file is the root of the bot and is just the top level file to everything. This is the thing that gets called first by the replit.

The `server.js` file is only for running a long running server that will listen on port `3000` that you can constantly ping to keep the replit alive.

## Available Discord Bot Commands
  - $remove_verify_key `key_value` - Will find this key in the database and remove it. NOTE: this doesn't effect the associated role with the user.
  - $remove_verify_name `discord_username` - Will find this discord_username in the database and remove it. NOTE: This doesn't effect this discord users associated role.
  - $purge_verify - This will drop all values in the verified users database. Only use this while testing!
  - $get_verify_key `key_value` - Will see if an entry in the verified purchasers database has this key. If it does it will output this entry to the chat channel.
  - $get_verify_name `discord_username` - Will see if an entry in the verified purchasers database has this discord username. If it does it will output this entry to the chat channel.
  - $reset_verify_attempts `discord_username` - This will unlock this discord user and allow them 10 more attempts to verify their key.
  - $purge_attempts - This will drop the entire lockout database. It will allow everyone that was locked out another 10 tries.
  - $verify `key` - This will attempt to verify a invoice number of gumroad license key and assign the `VERIFIED_ROLE_NAME` to the requester.