"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
/**
 * Decorator to log a custom message to the console when the decorated method is invoked.
 *
 * @param message - The message to be logged to the console.
 *
 * @example
 * @Log('myCommand has been called')
 * public async myCommand(interaction: Subcommand.ChatInputCommandInteraction) { ... }
 */
function Log(message) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const interaction = args[0];
            const discordNickname = interaction?.member?.nickname || 'unknown';
            const discordUsername = interaction?.user?.username || 'unknown';
            const discordDiscriminator = interaction?.user?.discriminator || 'unknown';
            const discordUserId = interaction?.user?.id || 'unknown';
            console.log(`[${discordNickname} (${discordUsername}#${discordDiscriminator}: ${discordUserId})] ${message}`);
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
exports.Log = Log;
//# sourceMappingURL=log-command.decorator.js.map