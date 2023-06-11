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
 * @AllowedUsers(['1234567890', '0987654321'])
 * public async myCommand(interaction: Subcommand.ChatInputCommandInteraction) { ... }
 */
export function AllowedUsers(requiredUserIds: string[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function(...args: any[]) {
            const interaction: Subcommand.ChatInputCommandInteraction = args[0];

            const userID = interaction.options.getUser('user')?.id ?? interaction.user.id;
            if (![GOOSY, LUCY, DIDDY, KOOPY, ...requiredUserIds].includes(userID)) {
                await interaction.reply({ content: `https://media.tenor.com/x8v1oNUOmg4AAAAd/rickroll-roll.gif` });
                return;
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
