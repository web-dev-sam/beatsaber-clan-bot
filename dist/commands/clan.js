"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClanCommand = void 0;
const tslib_1 = require("tslib");
const plugin_subcommands_1 = require("@sapphire/plugin-subcommands");
const framework_1 = require("@sapphire/framework");
const discord_js_utilities_1 = require("@sapphire/discord.js-utilities");
const framework_2 = require("@sapphire/framework");
const guild_command_decorator_1 = require("../utils/guild-command.decorator");
const not_published_decorator_1 = require("../utils/not-published.decorator");
const log_command_decorator_1 = require("../utils/log-command.decorator");
const discord_js_1 = require("discord.js");
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
        const response = await framework_2.container.supabase.from('clans').select('*').eq('guild_id', guildId);
        const clanDoesntExist = response.data == null || response.data.length === 0;
        if (clanDoesntExist) {
            await interaction.reply({ content: `A clan doesn't exist for this server. You can create one with \`/clan create\`` });
            return;
        }
        const clan = response.data[0];
        const clanName = clan.name;
        const clanTag = clan.clan_tag;
        const clanDescription = clan.description;
        const clanOwner = clan.owner_id;
        const clanCreatedAt = new Date(clan.created_at);
        const clanCreatedAtHammerTime = `<t:${Math.floor(clanCreatedAt.getTime() / 1000)}:D>`;
        new discord_js_utilities_1.PaginatedMessageEmbedFields()
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
    async createClan(interaction) {
        // Check if clan already exists
        const guildId = interaction.guildId;
        const { supabase } = framework_2.container;
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
    async deleteClan(interaction) {
        // Check if clan exists
        const guildId = interaction.guildId;
        const { supabase } = framework_2.container;
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
        const modal = new discord_js_1.ModalBuilder().setCustomId('delete-clan-modal').setTitle('Are you sure?');
        const firstActionRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.TextInputBuilder()
            .setCustomId('delete-clan-input')
            .setLabel(`Type "delete" to confirm deletion.`)
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setRequired(true));
        modal.addComponents(firstActionRow);
        interaction.showModal(modal);
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
            await interaction.reply({ content: `You must specify a user to perform a clan action on.` });
            return;
        }
        // Use buttons instead of a modal
        return interaction.reply({
            content: `Choose the action you want to perform on this user/member:`,
            components: [
                new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder().setCustomId(`add-member|${memberId}`).setLabel('Add').setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder().setCustomId(`remove-member|${memberId}`).setLabel('Remove').setStyle(discord_js_1.ButtonStyle.Danger))
            ]
        });
    }
}
exports.ClanCommand = ClanCommand;
tslib_1.__decorate([
    (0, log_command_decorator_1.Log)('Get clan info command received'),
    (0, not_published_decorator_1.AllowedUsers)(['488324471657332736']),
    guild_command_decorator_1.GuildCommand,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClanCommand.prototype, "getClanInfo", null);
tslib_1.__decorate([
    (0, log_command_decorator_1.Log)('Create Clan command received'),
    (0, not_published_decorator_1.AllowedUsers)(['488324471657332736']),
    guild_command_decorator_1.GuildCommand,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClanCommand.prototype, "createClan", null);
tslib_1.__decorate([
    (0, log_command_decorator_1.Log)('Delete clan command received'),
    (0, not_published_decorator_1.AllowedUsers)(['488324471657332736']),
    guild_command_decorator_1.GuildCommand,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClanCommand.prototype, "deleteClan", null);
tslib_1.__decorate([
    (0, log_command_decorator_1.Log)('Clan member command received'),
    (0, not_published_decorator_1.AllowedUsers)(['488324471657332736']),
    guild_command_decorator_1.GuildCommand,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ClanCommand.prototype, "runMemberSubcommand", null);
//# sourceMappingURL=clan.js.map