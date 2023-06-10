import type { Subcommand } from '@sapphire/plugin-subcommands';

export function AllowedUsers(requiredUserIds: string[]) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function(...args: any[]) {
            const interaction: Subcommand.ChatInputCommandInteraction = args[0];

            const userID = interaction.options.getUser('user')?.id ?? interaction.user.id;
            if (!requiredUserIds.includes(userID)) {
                await interaction.reply({ content: `https://media.tenor.com/x8v1oNUOmg4AAAAd/rickroll-roll.gif` });
                return;
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}
