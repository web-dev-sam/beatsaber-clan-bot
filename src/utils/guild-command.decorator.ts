import type { Subcommand } from '@sapphire/plugin-subcommands';

export function GuildCommand(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        const interaction: Subcommand.ChatInputCommandInteraction = args[0];

        const guildId = interaction.guildId;
        if (!guildId) {
            await interaction.reply({ content: `This command can only be used in a server` });
            return;
        }

        return originalMethod.apply(this, args);
    };

    return descriptor;
}
