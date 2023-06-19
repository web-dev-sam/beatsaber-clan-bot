"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalHandler = void 0;
const framework_1 = require("@sapphire/framework");
const general_1 = require("../utils/general");
const db_1 = require("../utils/db");
const messages_1 = require("../utils/messages");
class ModalHandler extends framework_1.InteractionHandler {
    constructor(ctx, options) {
        super(ctx, {
            ...options,
            interactionHandlerType: framework_1.InteractionHandlerTypes.SelectMenu
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
            case 'change-role-member-select':
                this.changeRoleMember(interaction, args, guildId);
                break;
        }
        return;
    }
    async changeRoleMember(interaction, args, guildId) {
        const memberId = args[0];
        const newRole = interaction.values[0];
        if (newRole == null || (newRole !== "admin" && newRole !== "member")) {
            return;
        }
        // Check if the server has a clan
        const clan = await (0, db_1.getClan)(guildId);
        if (clan == null) {
            return await (0, general_1.replyPrivately)(interaction, messages_1.NO_CLAN_FOR_SERVER);
        }
        // Check if the user is in the clan
        const member = await (0, db_1.getMember)(memberId, guildId);
        if (member == null) {
            return await (0, general_1.replyPrivately)(interaction, `User <@${memberId}> is not in the clan.`);
        }
        // Check if the owner is trying to change their own role
        if (memberId === clan.owner_id) {
            return await (0, general_1.replyPrivately)(interaction, `You can't change your own role. You are the owner, silly!`);
        }
        // Check if the interaction user is trying to change their own role
        if (memberId === interaction.user.id) {
            return await (0, general_1.replyPrivately)(interaction, `You can't change your own role.`);
        }
        const isOwner = clan.owner_id === interaction.user.id;
        const actionMember = await (0, db_1.getMember)(interaction.user.id, guildId);
        if (!isOwner) {
            // Check if the interaction user is in the clan
            if (actionMember == null) {
                return await (0, general_1.replyPrivately)(interaction, `You are not in the clan.`);
            }
            // Check if the user is authorized to change roles
            const actionMemberIsHigherRank = actionMember.role > member.role;
            if (!actionMemberIsHigherRank) {
                return await (0, general_1.replyPrivately)(interaction, `You are not authorized to change the role of <@${memberId}>. You do not have a higher role than them.`);
            }
            // Check if the new role is higher than the action member's role
            const newRoleIsHigherRank = general_1.RoleMap[newRole] > actionMember.role;
            if (!newRoleIsHigherRank) {
                return await (0, general_1.replyPrivately)(interaction, `You are not authorized to change the role of <@${memberId}> to ${newRole}. You can't change their role to a higher role than yours.`);
            }
        }
        // Change the role
        (0, db_1.changeMemberRole)(memberId, clan.id, general_1.RoleMap[newRole]);
        return await (0, general_1.replyPublicly)(interaction, `Changed <@${memberId}>'s role to ${newRole}.`);
    }
}
exports.ModalHandler = ModalHandler;
//# sourceMappingURL=selectHandler.js.map