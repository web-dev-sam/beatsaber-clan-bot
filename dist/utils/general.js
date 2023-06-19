"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyPublicly = exports.replyPrivately = exports.RoleMap = exports.ROLE = void 0;
const discord_js_1 = require("discord.js");
const framework_1 = require("@sapphire/framework");
const { devMode } = framework_1.container;
var ROLE;
(function (ROLE) {
    ROLE[ROLE["MEMBER"] = 0] = "MEMBER";
    ROLE[ROLE["ADMIN"] = 1] = "ADMIN";
})(ROLE || (exports.ROLE = ROLE = {}));
exports.RoleMap = {
    "member": ROLE.MEMBER,
    "admin": ROLE.ADMIN,
};
async function replyPrivately(interaction, content) {
    return await interaction.reply({
        content,
        ephemeral: true
    });
}
exports.replyPrivately = replyPrivately;
async function replyPublicly(interaction, content) {
    return await interaction.reply({
        content,
        ephemeral: devMode,
    });
}
exports.replyPublicly = replyPublicly;
//# sourceMappingURL=general.js.map