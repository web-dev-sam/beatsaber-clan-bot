import { Command, type ChatInputCommand } from '@sapphire/framework';
import { GuildCommand } from '../utils/guild-command.decorator';
import { AllowedUsers } from '../utils/not-published.decorator';
import { Log } from '../utils/log-command.decorator';
// import { ChannelType } from 'discord.js';

// interface UserData {
//     xp: number;
//     lastMessageDate: Date;
//     weeklyWordCount: number;
// }

export class PingCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, { ...options });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) => builder.setName('xp').setDescription('Calculate xp'));
    }

    @Log('XP command received')
    @AllowedUsers(['488324471657332736'])
    @GuildCommand
    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        // const userDataMap = new Map<string, UserData>();
        // let allMessages = [];
        // for (const [channelId, channel] of guild.channels.cache) {
        //     if (channel.type !== ChannelType.GuildText) {
        //         continue;
        //     }

        //     let lastId;

        //     while (true) {
        //         const options: {
        //             limit: number;
        //             before?: string;
        //         } = lastId ? { limit: 100, before: lastId } : { limit: 100 };

        //         try {
        //             const messages = await channel.messages.fetch(options);
        //             allMessages.push(...messages.values());
        //             lastId = messages.last()?.id;

        //             if (messages.size != 100) {
        //                 break;
        //             }
        //         } catch (err) {
        //             console.error(`Failed to fetch messages for channel ${channelId}`, err);
        //             break;
        //         }
        //     }
        // }

        // // Now allMessages contains all messages from all channels.
        // allMessages.forEach((message) => {
        //     const userId = message.author.id;
        //     const userMessageDate = message.createdAt;
        //     const wordCount = message.content.split(' ').length;

        //     let userData = userDataMap.get(userId);

        //     if (!userData) {
        //         userData = {
        //             xp: 0,
        //             lastMessageDate: new Date(0),
        //             weeklyWordCount: 0
        //         };
        //         userDataMap.set(userId, userData);
        //     }

        //     // Check if the user has sent a message today
        //     if (userMessageDate.toDateString() !== userData.lastMessageDate.toDateString()) {
        //         // If the user has sent at least 1 word today, give them 10 XP
        //         if (wordCount >= 1) {
        //             userData.xp += 10;
        //         }
        //     }

        //     // If the user has sent at least 50 words today, give them 100 XP
        //     if (wordCount >= 50) {
        //         userData.xp += 100;
        //     }

        //     // Update weekly word count
        //     if (userMessageDate.valueOf() - userData.lastMessageDate.valueOf() <= 7 * 24 * 60 * 60 * 1000) {
        //         userData.weeklyWordCount += wordCount;
        //     } else {
        //         userData.weeklyWordCount = wordCount;
        //     }

        //     // If the user has sent at least 350 words this week, give them 800 XP
        //     if (userData.weeklyWordCount >= 350) {
        //         userData.xp += 800;
        //         userData.weeklyWordCount = 0; // reset the weekly word count
        //     }

        //     // Update the last message date
        //     userData.lastMessageDate = userMessageDate;
        // });

        // console.log(userDataMap);

        return interaction.reply(`You have 120XP.`);
    }
}
