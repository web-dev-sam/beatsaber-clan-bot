"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = void 0;
const tslib_1 = require("tslib");
const framework_1 = require("@sapphire/framework");
const guild_command_decorator_1 = require("../utils/guild-command.decorator");
const not_published_decorator_1 = require("../utils/not-published.decorator");
const log_command_decorator_1 = require("../utils/log-command.decorator");
const discord_js_utilities_1 = require("@sapphire/discord.js-utilities");
const discord_js_1 = require("discord.js");
class HelpCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, { ...options });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder.setName('help').setDescription('Show help'));
    }
    async chatInputRun(interaction) {
        new discord_js_utilities_1.PaginatedMessage()
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
            {
                name: "/xp",
                value: "Work In Progress...",
                inline: false,
            },
        ]))
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
        ]))
            .run(interaction);
    }
}
exports.HelpCommand = HelpCommand;
tslib_1.__decorate([
    (0, log_command_decorator_1.Log)('Help command received'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], HelpCommand.prototype, "chatInputRun", null);
//# sourceMappingURL=help.js.map