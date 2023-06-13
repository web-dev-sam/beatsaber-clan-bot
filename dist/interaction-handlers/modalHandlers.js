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
            interactionHandlerType: framework_1.InteractionHandlerTypes.ModalSubmit
        });
    }
    async run(interaction) {
        const responses = {
            serverCommandOnly: 'This command can only be used in a server.',
            noClan: messages_1.NO_CLAN_FOR_SERVER,
            noConfirmation: `You did not type "delete". Aborting deletion.`
        };
        // Check if the server has a clan
        const guildId = interaction.guildId;
        if (guildId == null) {
            return await (0, general_1.replyPrivately)(interaction, responses.serverCommandOnly);
        }
        // Get Clan
        const clan = await (0, db_1.getClan)(guildId);
        if (clan == null) {
            return await (0, general_1.replyPrivately)(interaction, responses.noClan);
        }
        // Check if the user typed "delete"
        const confirmedDeletion = this.validateFirstTextInput(interaction, 'delete');
        if (!confirmedDeletion) {
            return await (0, general_1.replyPrivately)(interaction, responses.noConfirmation);
        }
        // Delete the clan with guild_id
        await (0, db_1.deleteClan)(guildId);
        return await (0, general_1.replyPublicly)(interaction, `Clan ${clan.name} has been deleted.`);
    }
    validateFirstTextInput(interaction, expectedValue) {
        const textInput = interaction.components[0].components[0];
        if (textInput.value == null) {
            return false;
        }
        return textInput.value.toLowerCase() === expectedValue;
    }
}
exports.ModalHandler = ModalHandler;
//# sourceMappingURL=modalHandlers.js.map