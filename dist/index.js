"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const dotenv = __importStar(require("dotenv"));
const framework_2 = require("@sapphire/framework");
const supabase_js_1 = require("@supabase/supabase-js");
const config = dotenv.config();
const client = new framework_1.SapphireClient({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages],
    loadMessageCommandListeners: true,
    presence: {
        activities: [
            {
                name: '/uwu',
                type: discord_js_1.ActivityType.Listening
            }
        ]
    }
});
client.logger.info('Connecting to database');
const supabaseUrl = 'https://bxfpomjadrhycfhwisps.supabase.co';
const supabaseKey = config.parsed?.SUPABASE_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
(async () => {
    try {
        client.logger.info('Connected to database');
        framework_2.container.supabase = supabase;
        framework_2.container.devMode = config.parsed?.DEV_MODE === 'true';
        client.logger.info('Logging in');
        await client.login(config.parsed?.DISCORD_TOKEN);
        client.logger.info('Logged in');
    }
    catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
})();
//# sourceMappingURL=index.js.map