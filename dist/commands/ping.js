"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingCommand = void 0;
const tslib_1 = require("tslib");
const discord_js_utilities_1 = require("@sapphire/discord.js-utilities");
const framework_1 = require("@sapphire/framework");
const log_command_decorator_1 = require("../utils/log-command.decorator");
class PingCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, { ...options });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder.setName('ping').setDescription('Ping bot to see if it is alive'));
    }
    async chatInputRun(interaction) {
        const msg = await interaction.reply({ content: `Pinging...`, ephemeral: true, fetchReply: true });
        if ((0, discord_js_utilities_1.isMessageInstance)(msg)) {
            const diff = msg.createdTimestamp - interaction.createdTimestamp;
            const ping = Math.round(this.container.client.ws.ping);
            return interaction.editReply(`Pong 🏓! (Round trip took: ${diff}ms. Heartbeat: ${ping}ms.)`);
        }
        return interaction.editReply('Failed to retrieve ping :(');
    }
}
exports.PingCommand = PingCommand;
tslib_1.__decorate([
    (0, log_command_decorator_1.Log)('Ping command received'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], PingCommand.prototype, "chatInputRun", null);
//# sourceMappingURL=ping.js.map