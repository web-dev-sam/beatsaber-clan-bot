"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalHandler = void 0;
const framework_1 = require("@sapphire/framework");
const framework_2 = require("@sapphire/framework");
class ModalHandler extends framework_1.InteractionHandler {
    constructor(ctx, options) {
        super(ctx, {
            ...options,
            interactionHandlerType: framework_1.InteractionHandlerTypes.ModalSubmit
        });
    }
    async run(interaction) {
        // Check if the server has a clan
        const guildId = interaction.guildId;
        const { supabase } = framework_2.container;
        const clans = await supabase.from('clans').select('*').eq('guild_id', guildId);
        if (clans.data == null || clans.data.length === 0) {
            await interaction.reply({
                content: 'This server does not have a clan. You can create one with `/clan create`.',
                ephemeral: true
            });
            return;
        }
        // Check if the user typed "delete"
        const deleteMessage = interaction.components[0].components[0].value ?? "";
        if (deleteMessage.toLowerCase() !== "delete") {
            await interaction.reply({
                content: 'You did not type "delete". Aborting deletion.',
                ephemeral: true
            });
            return;
        }
        // Delete the clan with guild_id
        await supabase.from('clans').delete().eq('guild_id', guildId);
        return await interaction.reply({
            content: `Clan ${clans.data[0].name} has been deleted.`,
        });
    }
}
exports.ModalHandler = ModalHandler;
//# sourceMappingURL=modalHandlers.js.map