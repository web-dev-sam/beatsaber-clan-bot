"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildCommand = void 0;
/**
 * Decorator to restrict a command to be only used within a guild (server).
 * Methods using this decorator should have their interaction parameter typed as
 * ChatInputCommandInteractionWithGuildId.
 *
 * @example
 * @GuildCommand
 * public async myCommand(interaction: ChatInputCommandInteractionWithGuildId) { ... }
 */
function GuildCommand(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
        const interaction = args[0];
        const guildId = interaction.guildId;
        if (!guildId) {
            await interaction.reply({ content: `This command can only be used in a server` });
            return;
        }
        // Cast the interaction to the new type
        const interactionWithGuildId = interaction;
        interactionWithGuildId.guildId = guildId;
        // Call the original method with the modified interaction
        return originalMethod.apply(this, [interactionWithGuildId, ...args.slice(1)]);
    };
    return descriptor;
}
exports.GuildCommand = GuildCommand;
//# sourceMappingURL=guild-command.decorator.js.map