import { SapphireClient } from '@sapphire/framework';
import { ActivityType, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import * as admin from 'firebase-admin';
import serviceAccountKey from './firestore-key.json';
import { container } from '@sapphire/framework';

const config = dotenv.config();
const client = new SapphireClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    loadMessageCommandListeners: true,
    presence: {
        activities: [
            {
                name: '/xp',
                type: ActivityType.Listening
            }
        ]
    }
});

client.logger.info('Connecting to database');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey as admin.ServiceAccount),
    databaseURL: 'https://beatsaber-clan-bot.firebaseio.com'
});

(async () => {
    try {
        client.logger.info('Connected to database');
        const db = admin.firestore();
        container.db = db;
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
        db: admin.firestore.Firestore;
        devMode: boolean;
    }
}
