import { Command, type ChatInputCommand } from '@sapphire/framework';
import { Log } from '../utils/log-command.decorator';
import { replyPublicly } from '../utils/general';

export class UwUCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, { ...options });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) => builder.setName('uwu').setDescription('uwu'));
    }

    @Log('UwU command received')
    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        return replyPublicly(interaction, 'UwU');
    }
}
