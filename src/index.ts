import {  SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';

const config = dotenv.config();

const client = new SapphireClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    loadMessageCommandListeners: true
});

(async () => {
    try {
        client.logger.info('Logging in');
        await client.login(config.parsed?.DISCORD_TOKEN);
        client.logger.info('logged in');
    } catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
})();
