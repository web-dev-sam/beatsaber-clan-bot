import type { Subcommand } from "@sapphire/plugin-subcommands";

interface ChatInputCommandInteractionWithGuildId extends Subcommand.ChatInputCommandInteraction {
    guildId: string;
}