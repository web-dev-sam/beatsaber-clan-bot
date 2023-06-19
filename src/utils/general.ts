import { Role, type AnySelectMenuInteraction, type ButtonInteraction, type ModalSubmitInteraction } from 'discord.js';
import type { ChatInputCommandInteractionWithGuildId } from '../global';
import type { Command } from '@sapphire/framework';
import { container } from '@sapphire/framework';
const { devMode } = container;

type RepliableInteraction =
    | ModalSubmitInteraction
    | ButtonInteraction
    | ChatInputCommandInteractionWithGuildId
    | Command.ChatInputCommandInteraction
    | AnySelectMenuInteraction;

export enum ROLE {
    MEMBER,
    ADMIN,
}

export const RoleMap = {
    "member": ROLE.MEMBER,
    "admin": ROLE.ADMIN,
};

export async function replyPrivately(interaction: RepliableInteraction, content: string) {
    return await interaction.reply({
        content,
        ephemeral: true
    });
}

export async function replyPublicly(interaction: RepliableInteraction, content: string) {
    return await interaction.reply({
        content,
        ephemeral: devMode,
    });
}
