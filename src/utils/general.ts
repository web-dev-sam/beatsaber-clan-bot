import type { ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import type { ChatInputCommandInteractionWithGuildId } from '../global';
import type { Command } from '@sapphire/framework';

type RepliableInteraction = ModalSubmitInteraction | ButtonInteraction | ChatInputCommandInteractionWithGuildId | Command.ChatInputCommandInteraction;

export enum ROLE {
    MEMBER,
    ADMIN,
    OWNER
}

export async function replyPrivately(interaction: RepliableInteraction, content: string) {
    return await interaction.reply({
        content,
        ephemeral: true
    });
}

export async function replyPublicly(interaction: RepliableInteraction, content: string) {
    return await interaction.reply({
        content
    });
}
