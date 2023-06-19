
import { container } from '@sapphire/framework';
import { ROLE } from './general';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
const { supabase, devMode } = container;

const TABLE = {
    CLANS: devMode ? 'clans_dev' : 'clans',
    MEMBERS: devMode ? 'members_dev' : 'members',
};

export async function deleteClan(guildId: string) {
    return await supabase.from(TABLE.CLANS).delete().eq('guild_id', guildId);
}

export async function getClan(guildId: string) {
    const clans = await supabase.from(TABLE.CLANS).select('*').eq('guild_id', guildId);
    if (clans.data == null || clans.data.length === 0) {
        return null;
    }
    return clans.data[0];
}

export async function getMemberByClan(discord_id: string, clanId: string) {
    const members = await supabase.from(TABLE.MEMBERS).select('*').eq('discord_id', discord_id).eq('clan_id', clanId);
    if (members.data == null || members.data.length === 0) {
        return null;
    }
    return members.data[0];
}

/** We need to join since member table doesnt have guild id, only clan id */
export async function getMember(discord_id: string, guildId: string) {
    const members = await supabase
        .from(TABLE.CLANS)
        .select(TABLE.MEMBERS + ` (discord_id, clan_id, role)`)
        .eq(TABLE.MEMBERS + '.discord_id', discord_id)
        .eq('guild_id', guildId) as PostgrestSingleResponse<{
            members_dev: {
                discord_id: any;
                clan_id: any;
                role: any;
            }[];
        }[]>;
    if (members.data == null || members.data.length === 0) {
        return null;
    }
    return members.data[0].members_dev[0];
}

export async function changeMemberRole(discord_id: string, clanId: string, role: ROLE) {
    return await supabase.from(TABLE.MEMBERS).update({ role }).eq('discord_id', discord_id).eq('clan_id', clanId);
}

export async function removeMember(discord_id: string, guildId: string) {
    return await supabase.from(TABLE.MEMBERS).delete().eq('discord_id', discord_id).eq('guild_id', guildId);
}

export async function addMember(discord_id: string, clanId: string, role: ROLE = ROLE.MEMBER) {
    return await supabase.from(TABLE.MEMBERS).insert([{ discord_id, clan_id: clanId, role }]);
}

export async function createClan(guildId: string, clanName: string, clanTag: string, clanDescription: string, ownerId: string) {
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
