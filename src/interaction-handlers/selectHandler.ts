import { InteractionHandler, InteractionHandlerTypes, type PieceContext } from '@sapphire/framework';
import type { AnySelectMenuInteraction, ModalSubmitInteraction, TextInputComponentData } from 'discord.js';
import { ROLE, RoleMap, replyPrivately, replyPublicly } from '../utils/general';
import { changeMemberRole, deleteClan, getClan, getMember } from '../utils/db';
import { NO_CLAN_FOR_SERVER } from '../utils/messages';

export class ModalHandler extends InteractionHandler {
    public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.SelectMenu
        });
    }

    public async run(interaction: AnySelectMenuInteraction) {
        const parts = interaction.customId.split('|');
        const action = parts[0];
        const args = parts.slice(1);
        const guildId = interaction.guildId;
        if (guildId == null) {
            return await replyPrivately(interaction, 'This command can only be used in a server.');
        }

        switch (action) {
            case 'change-role-member-select':
                this.changeRoleMember(interaction, args, guildId);
                break;
        }
        return;
    }

    private async changeRoleMember(interaction: AnySelectMenuInteraction, args: string[], guildId: string) {
        const memberId = args[0];
        const newRole = interaction.values[0];
        if (newRole == null || (newRole !== "admin" && newRole !== "member")) {
            return;
        }

        // Check if the server has a clan
        const clan = await getClan(guildId);
        if (clan == null) {
            return await replyPrivately(interaction, NO_CLAN_FOR_SERVER);
        }

        // Check if the user is in the clan
        const member = await getMember(memberId, guildId);
        if (member == null) {
            return await replyPrivately(interaction, `User <@${memberId}> is not in the clan.`);
        }

        // Check if the owner is trying to change their own role
        if (memberId === clan.owner_id) {
            return await replyPrivately(interaction, `You can't change your own role. You are the owner, silly!`);
        }

        // Check if the interaction user is trying to change their own role
        if (memberId === interaction.user.id) {
            return await replyPrivately(interaction, `You can't change your own role.`);
        }

        const isOwner = clan.owner_id === interaction.user.id;
        const actionMember = await getMember(interaction.user.id, guildId);
        if (!isOwner) {
            // Check if the interaction user is in the clan
            if (actionMember == null) {
                return await replyPrivately(interaction, `You are not in the clan.`);
            }

            // Check if the user is authorized to change roles
            const actionMemberIsHigherRank = actionMember.role > member.role;
            if (!actionMemberIsHigherRank) {
                return await replyPrivately(
                    interaction,
                    `You are not authorized to change the role of <@${memberId}>. You do not have a higher role than them.`
                );
            }
            
            // Check if the new role is higher than the action member's role
            const newRoleIsHigherRank = RoleMap[newRole] > actionMember.role;
            if (!newRoleIsHigherRank) {
                return await replyPrivately(
                    interaction,
                    `You are not authorized to change the role of <@${memberId}> to ${newRole}. You can't change their role to a higher role than yours.`
                );
            }
        }

        // Change the role
        changeMemberRole(memberId, clan.id, RoleMap[newRole]);
        return await replyPublicly(interaction, `Changed <@${memberId}>'s role to ${newRole}.`);
    }
}
