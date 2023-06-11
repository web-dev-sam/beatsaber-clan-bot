import { InteractionHandler, InteractionHandlerTypes, type PieceContext } from '@sapphire/framework';
import type { ModalSubmitInteraction, TextInputComponentData } from 'discord.js';
import { container } from '@sapphire/framework';

export class ModalHandler extends InteractionHandler {
    public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.ModalSubmit
        });
    }

    public async run(interaction: ModalSubmitInteraction) {

        // Check if the server has a clan
        const guildId = interaction.guildId;
        const { supabase } = container;
        const clans = await supabase.from('clans').select('*').eq('guild_id', guildId);
        if (clans.data == null || clans.data.length === 0) {
            await interaction.reply({
                content: 'This server does not have a clan. You can create one with `/clan create`.',
                ephemeral: true
            });
            return;
        }

        // Check if the user typed "delete"
        const deleteMessage = (interaction.components[0].components[0] as Partial<TextInputComponentData>).value ?? "";
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
