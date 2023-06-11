/**
 * Decorator to log a custom message to the console when the decorated method is invoked.
 *
 * @param message - The message to be logged to the console.
 *
 * @example
 * @Log('myCommand has been called')
 * public async myCommand(interaction: Subcommand.ChatInputCommandInteraction) { ... }
 */
export function Log(message: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args: any[]) {
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
