"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingCommand = void 0;
const discord_js_utilities_1 = require("@sapphire/discord.js-utilities");
const framework_1 = require("@sapphire/framework");
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
//# sourceMappingURL=ping.js.map