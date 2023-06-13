"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClan = exports.addMember = exports.removeMember = exports.getMember = exports.getClan = exports.deleteClan = void 0;
const framework_1 = require("@sapphire/framework");
const general_1 = require("./general");
const { supabase } = framework_1.container;
async function deleteClan(guildId) {
    return await supabase.from('clans').delete().eq('guild_id', guildId);
}
exports.deleteClan = deleteClan;
async function getClan(guildId) {
    const clans = await supabase.from('clans').select('*').eq('guild_id', guildId);
    if (clans.data == null || clans.data.length === 0) {
        return null;
    }
    return clans.data[0];
}
exports.getClan = getClan;
async function getMember(discord_id, guildId) {
    const members = await supabase.from('members').select('*').eq('discord_id', discord_id).eq('guild_id', guildId);
    if (members.data == null || members.data.length === 0) {
        return null;
    }
    return members.data[0];
}
exports.getMember = getMember;
async function removeMember(discord_id, guildId) {
    return await supabase.from('members').delete().eq('discord_id', discord_id).eq('guild_id', guildId);
}
exports.removeMember = removeMember;
async function addMember(discord_id, clanId, role = general_1.ROLE.MEMBER) {
    return await supabase.from('members').insert([{ discord_id, clan_id: clanId, role }]);
}
exports.addMember = addMember;
async function createClan(guildId, clanName, clanTag, clanDescription, ownerId) {
    return await supabase.from('clans').insert([
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