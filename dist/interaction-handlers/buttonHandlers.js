"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonHandler = void 0;
const framework_1 = require("@sapphire/framework");
const framework_2 = require("@sapphire/framework");
const { supabase } = framework_2.container;
class ButtonHandler extends framework_1.InteractionHandler {
    constructor(ctx, options) {
        super(ctx, {
            ...options,
            interactionHandlerType: framework_1.InteractionHandlerTypes.Button
        });
    }
    async run(interaction) {
        const parts = interaction.customId.split('|');
        const action = parts[0];
        const args = parts.slice(1);
        const guildId = interaction.guildId;
        if (guildId == null) {
            await interaction.reply({
                content: 'This command can only be used in a server.',
                ephemeral: true
            });
            return;
        }
        switch (action) {
            case 'add-member':
                this.addMember(interaction, args, guildId);
                break;
            case 'remove-member':
                this.removeMember(interaction, args, guildId);
                break;
        }
    }
    async addMember(interaction, args, guildId) {
        const memberId = args[0];
        // Check if the server has a clan
        const clan = await this.ensureClanExists(interaction, guildId);
        if (clan == null) {
            return;
        }
        // Check if the user is authorized to add members
        // You need to be the owner or an admin to add members
        if (clan.owner_id !== interaction.user.id) {
            const ADMIN_ROLE = 1;
            const admin = await supabase
                .from('members')
                .select('*')
                .eq('discord_id', interaction.user.id)
                .eq('clan_id', clan.id)
                .eq('role', ADMIN_ROLE);
            if (admin.data == null || admin.data.length === 0) {
                await interaction.reply({
                    content: 'You are not authorized to add members to this clan.',
                    ephemeral: true
                });
                return;
            }
        }
        // Check if the user is already a member
        const isMember = await supabase.from('members').select('*').eq('discord_id', memberId).eq('clan_id', clan.id);
        if (isMember.data != null && isMember.data.length > 0) {
            await interaction.reply({
                content: 'This user is already a member of this clan.',
                ephemeral: true
            });
            return;
        }
        // Add the user to the clan
        await supabase.from('members').insert([{ discord_id: memberId, clan_id: clan.id, role: 0 }]);
        await interaction.reply({
            content: `User <@${memberId}> has been added to the clan.`
        });
    }
    async removeMember(interaction, args, guildId) {
        const memberId = args[0];
        // Check if the server has a clan
        const clan = await this.ensureClanExists(interaction, guildId);
        if (clan == null) {
            return;
        }
        // Check if the user is authorized to remove members
        // You need to be the owner to remove members
        if (clan.owner_id !== interaction.user.id) {
            await interaction.reply({
                content: `You are not authorized to remove members from this clan. Only the clan owner <@${clan.owner_id}> can do that.`,
                ephemeral: true
            });
            return;
        }
        // Check if the user is a member
        const isMember = await supabase.from('members').select('*').eq('discord_id', memberId).eq('clan_id', clan.id);
        if (isMember.data == null || isMember.data.length === 0) {
            await interaction.reply({
                content: 'This user is not a member of this clan.',
                ephemeral: true
            });
            return;
        }
        // Remove the user from the clan
        await supabase.from('members').delete().eq('discord_id', memberId).eq('clan_id', clan.id);
        await interaction.reply({
            content: `User <@${memberId}> has been removed from the clan.`
        });
    }
    async ensureClanExists(interaction, guildId) {
        const clans = await supabase.from('clans').select('*').eq('guild_id', guildId);
        if (clans.data == null || clans.data.length === 0) {
            await interaction.reply({
                content: 'This server does not have a clan. You can create one with `/clan create`.',
                ephemeral: true
            });
            return null;
        }
        return clans.data[0];
    }
}
exports.ButtonHandler = ButtonHandler;
//# sourceMappingURL=buttonHandlers.js.map