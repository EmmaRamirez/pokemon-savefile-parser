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
const OFFSETS = {
    PLAYER_NAME: 0x2598,
    POKEDEX_OWNED: 0x25A3,
    POKEDEX_SEEN: 0x25B6,
    ITEM_BAG: 0x25C9,
    MONEY: 0x25F3,
    RIVAL_NAME: 0x25F6,
    OPTIONS: 0x2601,
    BADGES: 0x2602,
    PLAYER_ID: 0x2605,
    PIKACHU_FRIENDSHIP: 0x271C,
    ITEM_PC: 0x27E6,
    CURRENT_POKEMON_BOX_NUM: 0x284C,
    CASINO_COINS: 0x2850,
    TIME_PLAYED: 0x2CED,
    POKEMON_PARTY: 0x2F2C,
    CURRENT_POKEMON_BOX: 0x30C0,
    CHECKSUM: 0x3523,
    POKEMON_PC_FIRST_HALF: 0x4000,
    POKEMON_PC_SECOND_HALF: 0x6000,
    BOX_ONE: 0x4000,
    BOX_TWO: 0x4462
};
const checksum = (data) => {
    let checksum_n = 255;
    for (let i = 0x2598; i < OFFSETS.CHECKSUM; ++i) {
        checksum_n -= data[i];
    }
    return checksum_n;
};
const TYPE = {
    0x00: 'NORMAL',
    0x01: 'FIGHTING',
    0x02: 'FLYING',
    0x03: 'POSION',
    0x04: 'GROUND',
    0x05: 'ROCK',
    0x07: 'BUG',
    0x08: 'GHOST',
    0x14: 'FIRE',
    0x15: 'WATER',
    0x16: 'GRASS',
    0x17: 'ELECTRIC',
    0x18: 'PSYCHIC',
    0x19: 'ICE',
    0x1A: 'DRAGON'
};
const convertWithCharMap = (buf) => {
    let str = [];
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] == 0xFF)
            break;
        str.push(utils_1.GEN_1_CHARACTER_MAP[buf[i]] || '');
    }
    return str.join('');
};
const getSpeciesList = (buf) => {
    let str = [];
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] === 0xFF) {
            break;
        }
        else {
            str.push(utils_1.GEN_1_POKEMON_MAP[buf[i]] || 'MISSINGNO');
        }
    }
    return str;
};
const parsePartyPokemon = (buf) => {
    const pokemon = Buffer.from(buf);
    const species = utils_1.GEN_1_POKEMON_MAP[pokemon[0x00]];
    const level = pokemon[0x03];
    const type1 = TYPE[pokemon[0x05]];
    const type2 = TYPE[pokemon[0x06]];
    const moves = [
        utils_1.MOVES_ARRAY[pokemon[0x08]],
        utils_1.MOVES_ARRAY[pokemon[0x09]],
        utils_1.MOVES_ARRAY[pokemon[0x0A]],
        utils_1.MOVES_ARRAY[pokemon[0x0B]]
    ];
    return {
        species,
        level,
        type1,
        type2,
        moves
    };
};
function splitUp(arr, n) {
    var rest = arr.length % n, // how much to divide
    restUsed = rest, // to keep track of the division over the elements
    partLength = Math.floor(arr.length / n), result = [];
    for (var i = 0; i < arr.length; i += partLength) {
        var end = partLength + i, add = false;
        if (rest !== 0 && restUsed) {
            end++;
            restUsed--; // we've used one division element now
            add = true;
        }
        result.push(arr.slice(i, end)); // part of the array
        if (add) {
            i++; // also increment i in the case we added an extra element for division
        }
    }
    return result;
}
const getPokemonListForParty = (buf, entries = 6) => {
    const party = splitUp(Buffer.from(buf), entries);
    const pokes = party.map(box => parsePartyPokemon(box));
    return pokes;
};
const getPokemonListForBox = (buf, entries = 6) => {
    const box = splitUp(Buffer.from(buf), entries);
    const pokes = box.map(box => parsePartyPokemon(box));
    return pokes;
};
const getPokemonNames = (buf, entries = 6) => {
    const pokes = splitUp(Buffer.from(buf), entries);
    const names = pokes.map(poke => convertWithCharMap(poke));
    return names;
};
const parsePokemonParty = (buf) => {
    const party = Buffer.from(buf);
    const entriesUsed = party[0x0000];
    const rawSpeciesList = party.slice(0x0001, 0x0007);
    const speciesList = getSpeciesList(rawSpeciesList);
    const pokemonList = getPokemonListForParty(party.slice(0x0008, 0x0008 + 264), entriesUsed);
    const OTNames = party.slice(0x0110, 0x0110 + 66);
    const pokemonNames = getPokemonNames(party.slice(0x0152, 0x152 + 66), entriesUsed);
    return {
        entriesUsed,
        speciesList,
        pokemonList,
        // OTNames,
        pokemonNames
    };
};
const parseBoxedPokemon = (buf) => {
    const box = Buffer.from(buf);
    const entriesUsed = box[0x0000];
    const rawSpeciesList = box.slice(0x0001, 0x0001 + 21);
    const speciesList = getSpeciesList(rawSpeciesList);
    const pokemonList = getPokemonListForBox(box.slice(0x0016, 0x0016 + 660), entriesUsed);
    const OTNames = box.slice(0x02AA, 0x02AA + 220);
    const pokemonNames = getPokemonNames(box.slice(0x0386, 0x0386 + 220), entriesUsed);
    return {
        entriesUsed,
        speciesList,
        pokemonList,
        // OTNames,
        pokemonNames
    };
};
const transformPokemon = (pokemonObject, status) => {
    const TIER = Object.freeze({
        'Team': 1,
        'Boxed': 2,
        'Dead': 3
    });
    return pokemonObject.pokemonList.map((poke, index) => {
        return {
            position: (index + 1) * TIER[status],
            species: poke.species,
            status: status,
            level: poke.level,
            types: [poke.type1, poke.type2],
            moves: poke.moves
        };
    });
};
const parseTime = (buf) => {
    const time = Buffer.from(buf);
    const hours = time[0x01] + time[0x00];
    const minutes = Math.ceil(time[0x02] + (time[0x03] / 60));
    return `${hours}:${minutes}`;
};
exports.parseFile = (file, format) => __awaiter(this, void 0, void 0, function* () {
    const yellow = file[OFFSETS.PIKACHU_FRIENDSHIP] > 0;
    const trainerName = convertWithCharMap(file.slice(OFFSETS.PLAYER_NAME, OFFSETS.PLAYER_NAME + 11));
    const trainerID = file.slice(OFFSETS.PLAYER_ID, OFFSETS.PLAYER_ID + 2).map(char => char.toString()).join('');
    const rivalName = convertWithCharMap(file.slice(OFFSETS.RIVAL_NAME, OFFSETS.RIVAL_NAME + 11));
    const badges = file[OFFSETS.BADGES];
    const timePlayed = parseTime(file.slice(OFFSETS.TIME_PLAYED, OFFSETS.TIME_PLAYED + 4));
    const pokedexOwned = file.slice(OFFSETS.POKEDEX_OWNED, OFFSETS.POKEDEX_OWNED + 19);
    const pokedexSeen = file.slice(OFFSETS.POKEDEX_SEEN, OFFSETS.POKEDEX_SEEN + 19);
    const money = parseInt(file.slice(OFFSETS.MONEY, OFFSETS.MONEY + 3).map(d => d.toString(16)).join(''));
    const pokemonParty = parsePokemonParty(file.slice(OFFSETS.POKEMON_PARTY, OFFSETS.POKEMON_PARTY + 404));
    const casinoCoins = parseInt(file.slice(OFFSETS.CASINO_COINS, OFFSETS.CASINO_COINS + 2).map(d => d.toString(16)).join(''));
    const boxedPokemon = parseBoxedPokemon(file.slice(OFFSETS.BOX_ONE, OFFSETS.BOX_ONE + 1122));
    const deadPokemon = parseBoxedPokemon(file.slice(OFFSETS.BOX_TWO, OFFSETS.BOX_TWO + 11222));
    // const ellow = file[0];
    const save = {
        //yellow,
        trainerName,
        trainerID,
        timePlayed,
        money,
        pokemonParty,
        casinoCoins,
        // pokedexOwned,
        // pokedexSeen,
        badges,
        rivalName,
        boxedPokemon,
        deadPokemon
    };
    const save2 = {
        trainer: {
            name: trainerName,
            id: trainerID,
            time: timePlayed,
            money: money,
            badges: badges
        },
        pokemon: [
            ...transformPokemon(pokemonParty, 'Team'),
            ...transformPokemon(boxedPokemon, 'Boxed'),
            ...transformPokemon(deadPokemon, 'Dead')
        ],
    };
    // console.log(save2);
    return save2;
});
exports.loadGen1SaveFile = (filename, format = 'nuzlocke') => __awaiter(this, void 0, void 0, function* () {
    const save = yield fs.readFileSync(filename);
    try {
        const file = Buffer.from(save);
        const result = yield exports.parseFile(file, format);
        return yield result;
    }
    catch (_a) {
        throw new Error('fuck');
    }
});
// loadSaveFile('./yellow.sav');
/**
 * Money: 3175
 * Badges: 0?
 * Time: 0:35
 * Name: YELLOW
 * Party: level 11 PIKACHU
 */ 