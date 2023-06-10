import { Subcommand } from '@sapphire/plugin-subcommands';
import { type ChatInputCommand } from '@sapphire/framework';
import { PaginatedMessageEmbedFields } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { GuildCommand } from '../utils/guild-command.decorator';
import { AllowedUsers } from '../utils/not-published.decorator';
import { Log } from '../utils/log-command.decorator';

export class ClanCommand extends Subcommand {
    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'clan',
            subcommands: [
                {
                    name: 'create',
                    chatInputRun: 'createClan'
                },
                {
                    name: 'info',
                    chatInputRun: 'getClanInfo'
                }
            ]
        });
    }

    public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('clan')
                .setDescription('All clan specific commands')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('create')
                        .setDescription('Create a new clan')
                        .addStringOption((option) => option.setName('name').setDescription('The name of your clan').setRequired(true))
                        .addStringOption((option) => option.setName('tag').setDescription('Your clan tag. For Example: TC').setRequired(true))
                        .addStringOption((option) => option.setName('description').setDescription('The description of your clan').setRequired(false))
                )
                .addSubcommand((subcommand) => subcommand.setName('info').setDescription('Show information about your clan'))
        );
    }

    @Log('Create Clan command received')
    @AllowedUsers('488324471657332736')
    @GuildCommand
    public async createClan(interaction: Subcommand.ChatInputCommandInteraction) {
        const clanName = interaction.options.getString('name');
        const clanTag = interaction.options.getString('tag');
        const clanDescription = interaction.options.getString('description');
        const guildId = interaction.guildId;

        // Check if clan already exists
        const { db } = container;
        const snapshot = await db.collection('clans').where('guild_id', '==', guildId).limit(1).get();
        const clanExists = !snapshot.empty;
        if (clanExists) {
            await interaction.reply({ content: `A clan already exists for this server. You can only have one clan per server.` });
            return;
        }

        // Create clan if it doesn't exist
        await db.collection('clans').add({
            clan_tag: clanTag,
            description: clanDescription,
            guild_id: guildId,
            name: clanName,
            owner_id: interaction.user.id,
            created_at: new Date()
        });

        // We're done!
        return interaction.reply({ content: `Clan ${clanName} created!` });
    }

    @Log('Get clan info command received')
    @AllowedUsers('488324471657332736')
    @GuildCommand
    public async getClanInfo(interaction: Subcommand.ChatInputCommandInteraction) {
        const guildId = interaction.guildId;
        const snapshot = await container.db.collection('clans').where('guild_id', '==', guildId).limit(1).get();
        const clanDoesntExist = snapshot.empty;
        if (clanDoesntExist) {
            await interaction.reply({ content: `A clan doesn't exist for this server. You can create one with \`/clan create\`` });
            return;
        }

        const clan = snapshot.docs[0].data();
        const clanName = clan.name;
        const clanTag = clan.clan_tag;
        const clanDescription = clan.description;
        const clanOwner = clan.owner_id;
        const clanCreatedAt = clan.created_at;
        const clanCreatedAtHammerTime = `<t:${Math.floor(clanCreatedAt.seconds)}:D>`;

        new PaginatedMessageEmbedFields()
            .setTemplate({ title: 'Clan Info', color: 0x006080 })
            .setItems([
                {
                    name: 'Name',
                    value: clanName,
                    inline: true
                },
                {
                    name: 'Tag',
                    value: clanTag,
                    inline: true
                },
                {
                    name: 'Description',
                    value: clanDescription,
                    inline: true
                },
                {
                    name: 'Owner',
                    value: `<@${clanOwner}>`,
                    inline: true
                },
                {
                    name: 'Created At',
                    value: clanCreatedAtHammerTime,
                    inline: true
                }
            ])
            .setItemsPerPage(5)
            .make()
            .run(interaction);
    }
}
