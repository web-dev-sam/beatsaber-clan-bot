import { InteractionHandler, InteractionHandlerTypes, type PieceContext } from '@sapphire/framework';
import type { ModalSubmitInteraction, TextInputComponentData } from 'discord.js';
import { replyPrivately, replyPublicly } from '../utils/general';
import { deleteClan, getClan } from '../utils/db';
import { NO_CLAN_FOR_SERVER } from '../utils/messages';

export class ModalHandler extends InteractionHandler {
    public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.ModalSubmit
        });
    }

    public async run(interaction: ModalSubmitInteraction) {
        const responses = {
            serverCommandOnly: 'This command can only be used in a server.',
            noClan: NO_CLAN_FOR_SERVER,
            noConfirmation: `You did not type "delete". Aborting deletion.`
        };

        // Check if the server has a clan
        const guildId = interaction.guildId;
        if (guildId == null) {
            return await replyPrivately(interaction, responses.serverCommandOnly);
        }

        // Get Clan
        const clan = await getClan(guildId);
        if (clan == null) {
            return await replyPrivately(interaction, responses.noClan);
        }

        // Check if the user typed "delete"
        const confirmedDeletion = this.validateFirstTextInput(interaction, 'delete');
        if (!confirmedDeletion) {
            return await replyPrivately(interaction, responses.noConfirmation);
        }

        // Delete the clan with guild_id
        await deleteClan(guildId);
        return await replyPublicly(interaction, `Clan ${clan.name} has been deleted.`);
    }

    private validateFirstTextInput(interaction: ModalSubmitInteraction, expectedValue: string): boolean {
        const textInput = interaction.components[0].components[0] as Partial<TextInputComponentData>;
        if (textInput.value == null) {
            return false;
        }
        return textInput.value.toLowerCase() === expectedValue;
    }
}
