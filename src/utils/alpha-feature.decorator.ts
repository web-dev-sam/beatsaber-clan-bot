import type { Subcommand } from '@sapphire/plugin-subcommands';

const GOOSY = "488324471657332736";
const LUCY = "396387614070145025";
const DIDDY = "943561777369718845";
const KOOPY = "616628947966361601";

/**
 * Decorator to restrict command execution to a set of specific users.
 * 
 * @param requiredUserIds - Array of user IDs that are allowed to execute the command.
 * 
 * @example
 * @NotImplemented(['1234567890', '0987654321'])
 * public async myCommand(interaction: Subcommand.ChatInputCommandInteraction) { ... }
 */
export function AlphaFeature() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function(...args: any[]) {
            const interaction: Subcommand.ChatInputCommandInteraction = args[0];

            if (![GOOSY, LUCY, DIDDY, KOOPY].includes(interaction.user.id)) {
                await interaction.reply({ content: `no` });
                return;
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
