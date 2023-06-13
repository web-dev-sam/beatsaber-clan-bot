"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UwUCommand = void 0;
const tslib_1 = require("tslib");
const framework_1 = require("@sapphire/framework");
const log_command_decorator_1 = require("../utils/log-command.decorator");
class UwUCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, { ...options });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder.setName('uwu').setDescription('uwu'));
    }
    async chatInputRun(interaction) {
        return interaction.reply(`UwU`);
    }
}
exports.UwUCommand = UwUCommand;
tslib_1.__decorate([
    (0, log_command_decorator_1.Log)('UwU command received'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], UwUCommand.prototype, "chatInputRun", null);
//# sourceMappingURL=uwu.js.map