"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonHandler = void 0;
const framework_1 = require("@sapphire/framework");
const general_1 = require("../utils/general");
const db_1 = require("../utils/db");
const messages_1 = require("../utils/messages");
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
            return await (0, general_1.replyPrivately)(interaction, 'This command can only be used in a server.');
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
    async addMember(interaction, args, guildId) {
        const memberId = args[0];
        // Check if the server has a clan
        const clan = await (0, db_1.getClan)(guildId);
        if (clan == null) {
            return await (0, general_1.replyPrivately)(interaction, messages_1.NO_CLAN_FOR_SERVER);
        }
        // Check if the owner is trying to add themselves
        if (memberId === clan.owner_id) {
            return await (0, general_1.replyPrivately)(interaction, `You can't add yourself to the clan. You are the owner, silly!`);
        }
        // Check if the user is authorized to add members
        const isOwner = clan.owner_id !== interaction.user.id;
        if (!isOwner) {
            const member = await (0, db_1.getMember)(interaction.user.id, guildId);
            const isNotAdmin = member == null || member.role !== general_1.ROLE.ADMIN;
            if (isNotAdmin) {
                return await (0, general_1.replyPrivately)(interaction, `You are not authorized to add members to this clan. Only the clan owner <@${clan.owner_id}> can do that.`);
            }
        }
        // Check if the user is already a member
        const member = await (0, db_1.getMember)(memberId, guildId);
        if (member != null) {
            return await (0, general_1.replyPrivately)(interaction, `<@${memberId}> is already a member of this clan.`);
        }
        // Add the user to the clan
        await (0, db_1.addMember)(memberId, clan.id);
        return await (0, general_1.replyPrivately)(interaction, `User <@${memberId}> has been added to the clan.`);
    }
    async removeMember(interaction, args, guildId) {
        const memberId = args[0];
        // Check if the server has a clan
        const clan = await (0, db_1.getClan)(guildId);
        if (clan == null) {
            return await (0, general_1.replyPrivately)(interaction, messages_1.NO_CLAN_FOR_SERVER);
        }
        // Check if the owner is trying to remove themselves
        if (memberId === clan.owner_id) {
            return await (0, general_1.replyPrivately)(interaction, `Nice try, but you can't remove yourself from the clan. You are the owner! To delete the clan, use **/clan delete**.`);
        }
        // Check if the user is authorized to remove members
        if (clan.owner_id !== interaction.user.id) {
            return await (0, general_1.replyPrivately)(interaction, `You are not authorized to remove members from this clan. Only the clan owner <@${clan.owner_id}> can do that.`);
        }
        // Check if the user is a member
        const member = (0, db_1.getMember)(memberId, guildId);
        if (member == null) {
            return await (0, general_1.replyPrivately)(interaction, `This user is not a member of this clan.`);
        }
        // Remove the user from the clan
        await (0, db_1.removeMember)(memberId, guildId);
        return await (0, general_1.replyPrivately)(interaction, `User <@${memberId}> has been removed from the clan.`);
    }
}
exports.ButtonHandler = ButtonHandler;
//# sourceMappingURL=buttonHandlers.js.map