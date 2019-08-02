"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const utils_1 = require("./utils");
const gen2_1 = require("./utils/gen2");
const readCaughtData = (data) => {
    const binary = (data >>> 0).toString(2);
    const timeSlice = binary.slice(0, 1);
    const timeHex = parseInt(timeSlice[0] + timeSlice[1], 2).toString(16).toUpperCase();
    const timeMap = {
        0x01: 'morning',
        0x02: 'day',
        0x03: 'night',
    };
    const level = binary.slice(2, 8);
    const OtGender = binary.slice(9, 10);
    const location = binary.slice(11, 16);
};
const MOVES = {};
const parsePartyPokemon = (buf, boxed = false) => {
    const pokemon = Buffer.from(buf);
    const species = utils_1.GEN_1_POKEMON_MAP[pokemon[0x00]];
    const heldItem = gen2_1.HELD_ITEM[pokemon[0x01]];
    const moves = [
        utils_1.MOVES_ARRAY[pokemon[0x02]],
        utils_1.MOVES_ARRAY[pokemon[0x03]],
        utils_1.MOVES_ARRAY[pokemon[0x04]],
        utils_1.MOVES_ARRAY[pokemon[0x05]]
    ];
    const friendship = pokemon[0x1B];
    const caughtData = pokemon.slice(0x1D, 0x1D + 2);
    const level = pokemon[0x1F];
    const ivs = pokemon.slice(0x15, 0x15 + 2);
    const id = ivs.toString('binary');
    return {
        species,
        level,
        moves,
        id,
    };
};
const transformPokemon = (pokemon, status) => {
    return pokemon;
};
exports.parseFile = (file, format) => __awaiter(this, void 0, void 0, function* () {
});
exports.loadGen2SaveFile = (filename, format = 'nuzlocke') => __awaiter(this, void 0, void 0, function* () {
    const save = yield fs.readFileSync(filename);
    try {
        const file = Buffer.from(save);
        const result = yield exports.parseFile(file, format);
        return yield result;
    }
    catch (_a) {
        throw new Error('Oops');
    }
});
