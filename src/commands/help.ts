import { Command, type ChatInputCommand } from '@sapphire/framework';
import { Log } from '../utils/log-command.decorator';
import type { ChatInputCommandInteractionWithGuildId } from '../global';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';

export class HelpCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, { ...options });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) => builder.setName('help').setDescription('Show help'));
    }

    @Log('Help command received')
    public async chatInputRun(interaction: ChatInputCommandInteractionWithGuildId) {
        new PaginatedMessage()
            .addPageEmbed((embed) => embed
                .setTitle('Basic Help')
                .setDescription('Here is some basic help')
                .addFields([
                    {
                        name: "/help",
                        value: "Show this help",
                        inline: false,
                    },
                    {
                        name: "/ping",
                        value: "Ping the bot",
                        inline: false,
                    },
                    {
                        name: "/uwu",
                        value: "uwu",
                        inline: false,
                    },
                ])
            )
            .addPageEmbed((embed) => embed
                .setTitle('Clan Help for Admins')
                .setDescription('Here is some clan help')
                .addFields([
                    {
                        name: "/clan create",
                        value: "Create a clan. You will be the owner. You can only own one clan per server.",
                        inline: false,
                    },
                    {
                        name: "/clan delete",
                        value: "Delete your clan. You must be the owner.",
                        inline: false,
                    },
                    {
                        name: "/clan member <@user>",
                        value: "Perform actions on a clan member. You must be the owner or an admin. Actions include: *add*, *remove*.\n\n*Adding a member* will add the member without any data (WIP: They will need to complete their profile).\n*Removing a member* will remove the member from the clan. All data will be deleted.",
                        inline: false,
                    },
                ])
            )
            .run(interaction);
    }
}
