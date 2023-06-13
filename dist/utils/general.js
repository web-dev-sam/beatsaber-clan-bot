"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyPublicly = exports.replyPrivately = exports.ROLE = void 0;
var ROLE;
(function (ROLE) {
    ROLE[ROLE["MEMBER"] = 0] = "MEMBER";
    ROLE[ROLE["ADMIN"] = 1] = "ADMIN";
    ROLE[ROLE["OWNER"] = 2] = "OWNER";
})(ROLE || (exports.ROLE = ROLE = {}));
async function replyPrivately(interaction, content) {
    return await interaction.reply({
        content,
        ephemeral: true
    });
}
exports.replyPrivately = replyPrivately;
async function replyPublicly(interaction, content) {
    return await interaction.reply({
        content
    });
}
exports.replyPublicly = replyPublicly;
//# sourceMappingURL=general.js.map