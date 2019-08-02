"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const gen1_1 = require("./gen1");
__export(require("./gen1"));
if (process.argv[2] === 'test') {
    gen1_1.loadGen1SaveFile('./yellow.sav');
    gen1_1.loadGen1SaveFile('./blue.sav');
}
