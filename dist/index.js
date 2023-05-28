"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const dotenv = __importStar(require("dotenv"));
const config = dotenv.config();
const client = new framework_1.SapphireClient({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages],
    loadMessageCommandListeners: true
});
(async () => {
    try {
        client.logger.info('Logging in');
        await client.login(config.parsed?.DISCORD_TOKEN);
        client.logger.info('logged in');
    }
    catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
})();
//# sourceMappingURL=index.js.map