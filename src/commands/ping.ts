import { isMessageInstance } from '@sapphire/discord.js-utilities';
import { Command, type ChatInputCommand } from '@sapphire/framework';
import { GuildCommand } from '../utils/guild-command.decorator';
import { AllowedUsers } from '../utils/not-published.decorator';
import { Log } from '../utils/log-command.decorator';
import type { ChatInputCommandInteractionWithGuildId } from '../global';

export class PingCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, { ...options });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) => builder.setName('ping').setDescription('Ping bot to see if it is alive'));
    }

    @Log('Ping command received')
    @GuildCommand
    public async chatInputRun(interaction: ChatInputCommandInteractionWithGuildId) {
        const msg = await interaction.reply({ content: `Pinging...`, ephemeral: false, fetchReply: true });
        if (isMessageInstance(msg)) {
            const diff = msg.createdTimestamp - interaction.createdTimestamp;
            const ping = Math.round(this.container.client.ws.ping);
            return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
        }
        return interaction.editReply('Failed to retrieve ping :(');
    }
}
