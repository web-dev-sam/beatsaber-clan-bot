import { Command, type ChatInputCommand } from '@sapphire/framework';
export declare class PingCommand extends Command {
    constructor(context: Command.Context, options: Command.Options);
    registerApplicationCommands(registry: ChatInputCommand.Registry): void;
    chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<import("discord.js").Message<boolean>>;
}
//# sourceMappingURL=ping.d.ts.map