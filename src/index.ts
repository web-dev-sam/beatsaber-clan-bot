import { SapphireClient } from '@sapphire/framework';
import { ActivityType, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { container } from '@sapphire/framework';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const config = dotenv.config();
const client = new SapphireClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    loadMessageCommandListeners: true,
    presence: {
        activities: [
            {
                name: '/uwu',
                type: ActivityType.Listening
            }
        ]
    }
});

client.logger.info('Connecting to database');

const supabaseUrl = 'https://bxfpomjadrhycfhwisps.supabase.co';
const supabaseKey = config.parsed?.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
    try {
        client.logger.info('Connected to database');
        container.supabase = supabase;
        container.devMode = config.parsed?.DEV_MODE === 'true';
        client.logger.info('Logging in');
        await client.login(config.parsed?.DISCORD_TOKEN);
        client.logger.info('Logged in');
    } catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
})();

declare module '@sapphire/pieces' {
    interface Container {
        supabase: SupabaseClient<any, "public", any>;
        devMode: boolean;
    }
}
