"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClan = exports.addMember = exports.removeMember = exports.changeMemberRole = exports.getMember = exports.getMemberByClan = exports.getClan = exports.deleteClan = void 0;
const framework_1 = require("@sapphire/framework");
const general_1 = require("./general");
const { supabase, devMode } = framework_1.container;
const TABLE = {
    CLANS: devMode ? 'clans_dev' : 'clans',
    MEMBERS: devMode ? 'members_dev' : 'members',
};
async function deleteClan(guildId) {
    return await supabase.from(TABLE.CLANS).delete().eq('guild_id', guildId);
}
exports.deleteClan = deleteClan;
async function getClan(guildId) {
    const clans = await supabase.from(TABLE.CLANS).select('*').eq('guild_id', guildId);
    if (clans.data == null || clans.data.length === 0) {
        return null;
    }
    return clans.data[0];
}
exports.getClan = getClan;
async function getMemberByClan(discord_id, clanId) {
    const members = await supabase.from(TABLE.MEMBERS).select('*').eq('discord_id', discord_id).eq('clan_id', clanId);
    if (members.data == null || members.data.length === 0) {
        return null;
    }
    return members.data[0];
}
exports.getMemberByClan = getMemberByClan;
/** We need to join since member table doesnt have guild id, only clan id */
async function getMember(discord_id, guildId) {
    const members = await supabase
        .from(TABLE.CLANS)
        .select(TABLE.MEMBERS + ` (discord_id, clan_id, role)`)
        .eq(TABLE.MEMBERS + '.discord_id', discord_id)
        .eq('guild_id', guildId);
    if (members.data == null || members.data.length === 0) {
        return null;
    }
    return members.data[0].members_dev[0];
}
exports.getMember = getMember;
async function changeMemberRole(discord_id, clanId, role) {
    return await supabase.from(TABLE.MEMBERS).update({ role }).eq('discord_id', discord_id).eq('clan_id', clanId);
}
exports.changeMemberRole = changeMemberRole;
async function removeMember(discord_id, guildId) {
    return await supabase.from(TABLE.MEMBERS).delete().eq('discord_id', discord_id).eq('guild_id', guildId);
}
exports.removeMember = removeMember;
async function addMember(discord_id, clanId, role = general_1.ROLE.MEMBER) {
    return await supabase.from(TABLE.MEMBERS).insert([{ discord_id, clan_id: clanId, role }]);
}
exports.addMember = addMember;
async function createClan(guildId, clanName, clanTag, clanDescription, ownerId) {
    return await supabase.from(TABLE.CLANS).insert([
        {
            guild_id: guildId,
            name: clanName,
            clan_tag: clanTag,
            description: clanDescription,
            owner_id: ownerId
        }
    ]);
}
exports.createClan = createClan;
//# sourceMappingURL=db.js.map