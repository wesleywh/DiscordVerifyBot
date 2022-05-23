module.exports = {
    GetMessageMember: async function (client, msg) {
        if (msg.channel.type === "DM")
        {
            let guild = await client.guilds.fetch(process.env.SERVER_ID);
            member = await guild.members.fetch(msg.author.id);
            return member;
        }
        else 
        {
            return msg.member;
        }
    },
    GetMessageMemberIsAdminRole: async function (client, msg) {
        let member = await this.GetMessageMember(client, msg);
        return member.roles.cache.some(role => role.name === process.env.ADMIN_ROLE_NAME);
    },
    GetMessageMemberIsVerifiedRole: async function (client, msg) {
        let member = await this.GetMessageMember(client, msg);
        return member.roles.cache.some(role => role.name === process.env.VERIFIED_ROLE_NAME);
    }
}