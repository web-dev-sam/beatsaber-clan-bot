import { Subcommand } from '@sapphire/plugin-subcommands';
import { type ChatInputCommand } from '@sapphire/framework';
import { PaginatedMessageEmbedFields } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { GuildCommand } from '../utils/guild-command.decorator';
import { AllowedUsers } from '../utils/not-published.decorator';
import { Log } from '../utils/log-command.decorator';
import type { ChatInputCommandInteractionWithGuildId } from '../global';
import {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    type ModalActionRowComponentBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';

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
                    name: 'delete',
                    chatInputRun: 'deleteClan'
                },
                {
                    name: 'info',
                    chatInputRun: 'getClanInfo'
                },
                {
                    name: 'member',
                    chatInputRun: 'runMemberSubcommand'
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
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('member')
                        .setDescription('All member specific commands')
                        .addUserOption((option) => option.setName('user').setDescription('The user to perform a clan action on').setRequired(true))
                )
                .addSubcommand((subcommand) => subcommand.setName('delete').setDescription('Delete your clan'))
        );
    }

    @Log('Get clan info command received')
    @AllowedUsers(['488324471657332736'])
    @GuildCommand
    public async getClanInfo(interaction: ChatInputCommandInteractionWithGuildId) {
        const guildId = interaction.guildId;
        const response = await container.supabase.from('clans').select('*').eq('guild_id', guildId);
        const clanDoesntExist = response.data == null || response.data.length === 0;
        if (clanDoesntExist) {
            await interaction.reply({ content: `A clan doesn't exist for this server. You can create one with \`/clan create\`` });
            return;
        }

        const clan = response.data[0];
        const clanName: string = clan.name;
        const clanTag: string = clan.clan_tag;
        const clanDescription: string = clan.description;
        const clanOwner: string = clan.owner_id;
        const clanCreatedAt = new Date(clan.created_at);
        const clanCreatedAtHammerTime = `<t:${Math.floor(clanCreatedAt.getTime() / 1000)}:D>`;

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

    @Log('Create Clan command received')
    @AllowedUsers(['488324471657332736'])
    @GuildCommand
    public async createClan(interaction: ChatInputCommandInteractionWithGuildId) {
        // Check if clan already exists
        const guildId = interaction.guildId;
        const { supabase } = container;
        const snapshot = await supabase.from('clans').select('*').eq('guild_id', guildId);
        const clanExists = snapshot.data && snapshot.data.length > 0;
        if (clanExists) {
            await interaction.reply({ content: `A clan already exists for this server. You can only have one clan per server.` });
            return;
        }

        const clanName = interaction.options.getString('name');
        const clanTag = interaction.options.getString('tag');
        const clanDescription = interaction.options.getString('description');

        // Create clan if it doesn't exist
        const { user } = interaction;
        const { id: ownerId } = user;
        const { data: clanData, error } = await supabase.from('clans').insert([
            {
                guild_id: guildId,
                name: clanName,
                clan_tag: clanTag,
                description: clanDescription,
                owner_id: ownerId
            }
        ]);

        // Check for errors
        if (error) {
            console.error(error);
            await interaction.reply({ content: `There was an error creating your clan. Please try again later. Error Code: ${error.code}` });
            return;
        }

        // We're done!
        return interaction.reply({ content: `Clan ${clanName} has been created!` });
    }

    @Log('Delete clan command received')
    @AllowedUsers(['488324471657332736'])
    @GuildCommand
    public async deleteClan(interaction: ChatInputCommandInteractionWithGuildId) {
        // Check if clan exists
        const guildId = interaction.guildId;
        const { supabase } = container;
        const snapshot = await supabase.from('clans').select('*').eq('guild_id', guildId);
        const clanDoesntExist = snapshot.data == null || snapshot.data.length === 0;
        if (clanDoesntExist) {
            await interaction.reply({ content: `A clan doesn't exist for this server. You can create one with \`/clan create\`` });
            return;
        }

        // Check if user is owner of clan
        const ownerId = snapshot.data[0].owner_id;
        if (ownerId !== interaction.user.id) {
            await interaction.reply({
                content: `You are not the owner of this clan. Message <@${ownerId}> to delete the clan. Only they can do it.`
            });
            return;
        }

        // Modal to confirm deletion
        const modal = new ModalBuilder().setCustomId('delete-clan-modal').setTitle('Are you sure?');
        const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            new TextInputBuilder()
                .setCustomId('delete-clan-input')
                .setLabel(`Type "delete" to confirm deletion.`)
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
        );
        modal.addComponents(firstActionRow);
        interaction.showModal(modal);
    }

    @Log('Clan member command received')
    @AllowedUsers(['488324471657332736'])
    @GuildCommand
    public async runMemberSubcommand(interaction: ChatInputCommandInteractionWithGuildId) {
        // const modal = new ModalBuilder().setCustomId('memberModal').setTitle('UwU Daddy-Chan');
        // const favoriteColorInput = new TextInputBuilder()
        //     .setCustomId('favoriteColorInput')
        //     .setLabel("What's your favorite color?")
        //     .setStyle(TextInputStyle.Short);
        // const hobbiesInput = new TextInputBuilder()
        //     .setCustomId('hobbiesInput')
        //     .setLabel("What's some of your favorite hobbies?")
        //     .setStyle(TextInputStyle.Paragraph);
        // const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(favoriteColorInput);
        // const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(hobbiesInput);
        // modal.addComponents(firstActionRow, secondActionRow);
        // interaction.showModal(modal);

        // Use buttons instead of a modal
        return interaction.reply({
            content: `Choose the action you want to perform on this user/member:`,
            ephemeral: true,
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder().setCustomId('add-member').setLabel('Add').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('promote-member').setLabel('Promote').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('demote-member').setLabel('Demote').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('kick-member').setLabel('Kick').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('remove-member').setLabel('Remove').setStyle(ButtonStyle.Danger)
                )
            ]
        });
    }
}
