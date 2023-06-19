import { Subcommand } from '@sapphire/plugin-subcommands';
import { type ChatInputCommand } from '@sapphire/framework';
import { PaginatedMessageEmbedFields } from '@sapphire/discord.js-utilities';
import { GuildCommand } from '../utils/guild-command.decorator';
import { AlphaFeature } from '../utils/alpha-feature.decorator';
import { Log } from '../utils/log-command.decorator';
import type { ChatInputCommandInteractionWithGuildId } from '../global';
import {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    type ModalActionRowComponentBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField
} from 'discord.js';
import { addMember, createClan, getClan } from '../utils/db';
import { ROLE, replyPrivately, replyPublicly } from '../utils/general';
import { CLAN_ALREADY_EXISTS, NO_CLAN_FOR_SERVER } from '../utils/messages';

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
    @GuildCommand
    public async getClanInfo(interaction: ChatInputCommandInteractionWithGuildId) {
        const guildId = interaction.guildId;
        const clan = await getClan(guildId);
        if (clan == null) {
            return await replyPrivately(interaction, NO_CLAN_FOR_SERVER);
        }

        const clanName: string = clan.name;
        const clanTag: string = clan.clan_tag;
        const clanDescription: string = clan.description;
        const clanOwner: string = clan.owner_id;
        const clanCreatedAt = new Date(clan.created_at);
        const clanCreatedAtHammerTime = `<t:${Math.floor(clanCreatedAt.getTime() / 1000)}:D>`;
        new PaginatedMessageEmbedFields()
            .setTemplate({ title: 'Clan Info', color: 0x006080 })
            .setItems([
                { name: 'Name', value: clanName, inline: true },
                { name: 'Tag', value: clanTag, inline: true },
                { name: 'Description', value: clanDescription, inline: true },
                { name: 'Owner', value: `<@${clanOwner}>`, inline: true },
                { name: 'Created At', value: clanCreatedAtHammerTime, inline: true }
            ])
            .setItemsPerPage(5)
            .make()
            .run(interaction);
        return;
    }

    @Log('Create Clan command received')
    @GuildCommand
    public async createClan(interaction: ChatInputCommandInteractionWithGuildId) {

        // Check if user is a server admin
        const member = interaction.member;
        if (member == null || !(member.permissions as PermissionsBitField).has(PermissionsBitField.Flags.Administrator)) {
            return await replyPrivately(interaction, `You must be a server administrator to create a clan.`);
        }

        // Check if clan already exists
        const guildId = interaction.guildId;
        const existingClan = await getClan(guildId);
        if (existingClan != null) {
            return await replyPrivately(interaction, CLAN_ALREADY_EXISTS);
        }

        // Get clan info
        const clanName = interaction.options.getString('name');
        const clanTag = interaction.options.getString('tag');
        const clanDescription = interaction.options.getString('description') ?? '';
        if (clanName == null || clanTag == null) {
            replyPrivately(interaction, `You must specify a name and tag for your clan.`);
            return;
        }

        // Create clan if it doesn't exist
        const ownerId = interaction.user.id;
        const { error } = await createClan(guildId, clanName, clanTag, clanDescription, ownerId);
        const clan = await getClan(guildId);
        if (error || clan == null) {
            console.error(error);
            return await replyPrivately(
                interaction,
                `There was an error creating your clan. Please try again later. Error Code: ${error?.code ?? 'unknown'}`
            );
        }

        await addMember(ownerId, clan.id, ROLE.OWNER);
        return await replyPublicly(interaction, `Clan ${clanName} has been created!`);
    }

    @Log('Delete clan command received')
    @GuildCommand
    public async deleteClan(interaction: ChatInputCommandInteractionWithGuildId) {

        // Check if clan exists
        const guildId = interaction.guildId;
        const clan = await getClan(guildId);
        if (clan == null) {
            return await replyPrivately(interaction, NO_CLAN_FOR_SERVER);
        }

        // Check if user is owner of clan
        if (clan.owner_id !== interaction.user.id) {
            return await replyPrivately(interaction, `You are not the owner of this clan. Only the owner <@${clan.owner_id}> can delete the clan.`);
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
        return;
    }

    @Log('Clan member command received')
    @AlphaFeature()
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

        const memberId = interaction.options.getUser('user')?.id;
        if (memberId == null) {
            return await replyPrivately(interaction, `You must specify a user to perform a clan action on.`);
        }

        // Use buttons instead of a modal
        return interaction.reply({
            content: `Choose the action you want to perform on this user/member:`,
            ephemeral: true,
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder().setCustomId(`add-member|${memberId}`).setLabel('Add').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId(`remove-member|${memberId}`).setLabel('Remove').setStyle(ButtonStyle.Danger)
                )
            ]
        });
    }
}
