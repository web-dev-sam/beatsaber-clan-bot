import { InteractionHandler, InteractionHandlerTypes, type PieceContext } from '@sapphire/framework';
import type { ButtonInteraction, TextInputComponentData } from 'discord.js';
import { ROLE, replyPrivately, replyPublicly } from '../utils/general';
import { addMember, getClan, getMember, removeMember } from '../utils/db';
import { NO_CLAN_FOR_SERVER } from '../utils/messages';

export class ButtonHandler extends InteractionHandler {
    public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.Button
        });
    }

    public async run(interaction: ButtonInteraction) {
        const parts = interaction.customId.split('|');
        const action = parts[0];
        const args = parts.slice(1);
        const guildId = interaction.guildId;
        if (guildId == null) {
            return await replyPrivately(interaction, 'This command can only be used in a server.');
        }

        switch (action) {
            case 'add-member':
                this.addMember(interaction, args, guildId);
                break;
            case 'remove-member':
                this.removeMember(interaction, args, guildId);
                break;
        }
        return;
    }

    private async addMember(interaction: ButtonInteraction, args: string[], guildId: string) {
        const memberId = args[0];

        // Check if the server has a clan
        const clan = await getClan(guildId);
        if (clan == null) {
            return await replyPrivately(interaction, NO_CLAN_FOR_SERVER);
        }

        // Check if the owner is trying to add themselves
        if (memberId === clan.owner_id) {
            return await replyPrivately(interaction, `You can't add yourself to the clan. You are the owner, silly!`);
        }

        // Check if the user is authorized to add members
        const isOwner = clan.owner_id !== interaction.user.id;
        if (!isOwner) {
            const member = await getMember(interaction.user.id, guildId);
            const isNotAdmin = member == null || member.role !== ROLE.ADMIN;
            if (isNotAdmin) {
                return await replyPrivately(
                    interaction,
                    `You are not authorized to add members to this clan. Only the clan owner <@${clan.owner_id}> can do that.`
                );
            }
        }

        // Check if the user is already a member
        const member = await getMember(memberId, guildId);
        if (member != null) {
            return await replyPrivately(interaction, `<@${memberId}> is already a member of this clan.`);
        }

        // Add the user to the clan
        await addMember(memberId, clan.id);
        return await replyPrivately(interaction, `User <@${memberId}> has been added to the clan.`);
    }

    private async removeMember(interaction: ButtonInteraction, args: string[], guildId: string) {
        const memberId = args[0];

        // Check if the server has a clan
        const clan = await getClan(guildId);
        if (clan == null) {
            return await replyPrivately(interaction, NO_CLAN_FOR_SERVER);
        }

        // Check if the owner is trying to remove themselves
        if (memberId === clan.owner_id) {
            return await replyPrivately(interaction, `Nice try, but you can't remove yourself from the clan. You are the owner! To delete the clan, use **/clan delete**.`);
        }

        // Check if the user is authorized to remove members
        if (clan.owner_id !== interaction.user.id) {
            return await replyPrivately(
                interaction,
                `You are not authorized to remove members from this clan. Only the clan owner <@${clan.owner_id}> can do that.`
            );
        }

        // Check if the user is a member
        const member = getMember(memberId, guildId);
        if (member == null) {
            return await replyPrivately(interaction, `This user is not a member of this clan.`);
        }

        // Remove the user from the clan
        await removeMember(memberId, guildId);
        return await replyPrivately(interaction, `User <@${memberId}> has been removed from the clan.`);
    }
}
