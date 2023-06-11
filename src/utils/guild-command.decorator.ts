import type { Subcommand } from '@sapphire/plugin-subcommands';
import type { ChatInputCommandInteractionWithGuildId } from '../global';

/**
 * Decorator to restrict a command to be only used within a guild (server).
 * Methods using this decorator should have their interaction parameter typed as
 * ChatInputCommandInteractionWithGuildId.
 * 
 * @example
 * @GuildCommand
 * public async myCommand(interaction: ChatInputCommandInteractionWithGuildId) { ... }
 */
export function GuildCommand(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        const interaction = args[0] as Subcommand.ChatInputCommandInteraction;

        const guildId = interaction.guildId;
        if (!guildId) {
            await interaction.reply({ content: `This command can only be used in a server` });
            return;
        }

        // Cast the interaction to the new type
        const interactionWithGuildId: ChatInputCommandInteractionWithGuildId = interaction as any;
        interactionWithGuildId.guildId = guildId;

        // Call the original method with the modified interaction
        return originalMethod.apply(this, [interactionWithGuildId, ...args.slice(1)]);
    };

    return descriptor;
}