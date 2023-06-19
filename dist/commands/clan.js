"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClanCommand = void 0;
const tslib_1 = require("tslib");
const plugin_subcommands_1 = require("@sapphire/plugin-subcommands");
const framework_1 = require("@sapphire/framework");
const discord_js_utilities_1 = require("@sapphire/discord.js-utilities");
const guild_command_decorator_1 = require("../utils/guild-command.decorator");
const alpha_feature_decorator_1 = require("../utils/alpha-feature.decorator");
const log_command_decorator_1 = require("../utils/log-command.decorator");
const discord_js_1 = require("discord.js");
const db_1 = require("../utils/db");
const general_1 = require("../utils/general");
const messages_1 = require("../utils/messages");
class ClanCommand extends plugin_subcommands_1.Subcommand {
    constructor(context, options) {
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
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('clan')
            .setDescription('All clan specific commands')
            .addSubcommand((subcommand) => subcommand
            .setName('create')
            .setDescription('Create a new clan')
            .addStringOption((option) => option.setName('name').setDescription('The name of your clan').setRequired(true))
            .addStringOption((option) => option.setName('tag').setDescription('Your clan tag. For Example: TC').setRequired(true))
            .addStringOption((option) => option.setName('description').setDescription('The description of your clan').setRequired(false)))
            .addSubcommand((subcommand) => subcommand.setName('info').setDescription('Show information about your clan'))
            .addSubcommand((subcommand) => subcommand
            .setName('member')
            .setDescription('All member specific commands')
            .addUserOption((option) => option.setName('user').setDescription('The user to perform a clan action on').setRequired(true)))
            .addSubcommand((subcommand) => subcommand.setName('delete').setDescription('Delete your clan')));
    }
    async getClanInfo(interaction) {
        const guildId = interaction.guildId;
        const clan = await (0, db_1.getClan)(guildId);
        if (clan == null) {
            return await (0, general_1.replyPrivately)(interaction, messages_1.NO_CLAN_FOR_SERVER);
        }
        const clanName = clan.name;
        const clanTag = clan.clan_tag;
        const clanDescription = clan.description;
        const clanOwner = clan.owner_id;
        const clanCreatedAt = new Date(clan.created_at);
        const clanCreatedAtHammerTime = `<t:${Math.floor(clanCreatedAt.getTime() / 1000)}:D>`;
        new discord_js_utilities_1.PaginatedMessageEmbedFields()
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
    async createClan(interaction) {
        // Check if user is a server admin
        const member = interaction.member;
        if (member == null || !member.permissions.has(discord_js_1.PermissionsBitField.Flags.Administrator)) {
            return await (0, general_1.replyPrivately)(interaction, `You must be a server administrator to create a clan.`);
        }
        // Check if clan already exists
        const guildId = interaction.guildId;
        const existingClan = await (0, db_1.getClan)(guildId);
        if (existingClan != null) {
            return await (0, general_1.replyPrivately)(interaction, messages_1.CLAN_ALREADY_EXISTS);
        }
        // Get clan info
        const clanName = interaction.options.getString('name');
        const clanTag = interaction.options.getString('tag');
        const clanDescription = interaction.options.getString('description') ?? '';
        if (clanName == null || clanTag == null) {
            (0, general_1.replyPrivately)(interaction, `You must specify a name and tag for your clan.`);
            return;
        }
        // Create clan if it doesn't exist
        const ownerId = interaction.user.id;
        const { error } = await (0, db_1.createClan)(guildId, clanName, clanTag, clanDescription, ownerId);
        const clan = await (0, db_1.getClan)(guildId);
        if (error || clan == null) {
            console.error(error);
            return await (0, general_1.replyPrivately)(interaction, `There was an error creating your clan. Please try again later. Error Code: ${error?.code ?? 'unknown'}`);
        }
        return await (0, general_1.replyPublicly)(interaction, `Clan ${clanName} has been created!`);
    }
    async deleteClan(interaction) {
        // Check if clan exists
        const guildId = interaction.guildId;
        const clan = await (0, db_1.getClan)(guildId);
        if (clan == null) {
            return await (0, general_1.replyPrivately)(interaction, messages_1.NO_CLAN_FOR_SERVER);
        }
        // Check if user is owner of clan
        if (clan.owner_id !== interaction.user.id) {
            return await (0, general_1.replyPrivately)(interaction, `You are not the owner of this clan. Only the owner <@${clan.owner_id}> can delete the clan.`);
        }
        // Modal to confirm deletion
        const modal = new discord_js_1.ModalBuilder().setCustomId('delete-clan-modal').setTitle('Are you sure?');
        const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
            .setCustomId('delete-clan-input')
            .setLabel(`Type "delete" to confirm deletion.`)
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true));
        modal.addComponents(firstActionRow);
        interaction.showModal(modal);
        return;
    }
    async runMemberSubcommand(interaction) {
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
            return await (0, general_1.replyPrivately)(interaction, `You must specify a user to perform a clan action on.`);
        }
        // Use buttons instead of a modal
        return interaction.reply({
            content: `Choose the action you want to perform on this user/member:`,
            ephemeral: true,
            components: [
                new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(`add-member|${memberId}`).setLabel('Add').setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId(`change-role-member|${memberId}`).setLabel('Change Role').setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder().setCustomId(`remove-member|${memberId}`).setLabel('Remove').setStyle(discord_js_1.ButtonStyle.Danger))
            ]
        });
    }
}
exports.ClanCommand = ClanCommand;
tslib_1.__decorate([
    (0, log_command_decorator_1.Log)('Get clan info command received'),
    guild_command_decorator_1.GuildCommand,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClanCommand.prototype, "getClanInfo", null);
tslib_1.__decorate([
    (0, log_command_decorator_1.Log)('Create Clan command received'),
    guild_command_decorator_1.GuildCommand,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClanCommand.prototype, "createClan", null);
tslib_1.__decorate([
    (0, log_command_decorator_1.Log)('Delete clan command received'),
    guild_command_decorator_1.GuildCommand,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClanCommand.prototype, "deleteClan", null);
tslib_1.__decorate([
    (0, log_command_decorator_1.Log)('Clan member command received'),
    (0, alpha_feature_decorator_1.AlphaFeature)(),
    guild_command_decorator_1.GuildCommand,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClanCommand.prototype, "runMemberSubcommand", null);
//# sourceMappingURL=clan.js.map