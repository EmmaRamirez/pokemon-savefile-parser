import * as fs from 'fs';
import { GEN_1_POKEMON_MAP, GEN_1_CHARACTER_MAP, MOVES_ARRAY } from './utils';

interface GEN_1_SAVE {
    yellow: boolean;
    pokemonParty: any;
    currentPokemonBoxNum: any;
    currentPokemonBox: any;
    pokemonBoxes: any[];
    pokedexSeen: any;
    pokedexOwned: any;
    itemBag: any;
    itemPC: any;
    timePlayed: any;
    money: any;
    casinoCoins: any;
    trainerID: any;
    trainerName: any;
    rivalName: any;
    badges: any;
    pikachuFriendship: any;
}

const OFFSETS = {
    PLAYER_NAME             : 0x2598,
    POKEDEX_OWNED           : 0x25A3,
    POKEDEX_SEEN            : 0x25B6,
    ITEM_BAG                : 0x25C9,
    MONEY                   : 0x25F3,
    RIVAL_NAME              : 0x25F6,
    OPTIONS                 : 0x2601,
    BADGES                  : 0x2602,
    PLAYER_ID               : 0x2605,
    PIKACHU_FRIENDSHIP      : 0x271C,
    ITEM_PC                 : 0x27E6,
    CURRENT_POKEMON_BOX_NUM : 0x284C,
    CASINO_COINS            : 0x2850,
    TIME_PLAYED             : 0x2CED,
    POKEMON_PARTY           : 0x2F2C,
    CURRENT_POKEMON_BOX     : 0x30C0,
    CHECKSUM                : 0x3523,
    POKEMON_PC_FIRST_HALF   : 0x4000,
    POKEMON_PC_SECOND_HALF  : 0x6000,
    BOX_ONE                 : 0x4000,
    BOX_TWO                 : 0x4462
};

const checksum = (data: Uint8Array) => {
    let checksum_n = 255;
    for (let i = 0x2598; i < OFFSETS.CHECKSUM; ++i) {
        checksum_n -= data[i];
    }
    return checksum_n;
}

export const loadGen1SaveFile = (filename: string) => {
    return fs.readFile(filename, (err, data) => {
        if (err) throw err;
        const file = Buffer.from(data);
        return parseFile(file);
    });
}

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
}

interface Pokemon {
    species: number;
    current_hp: number;
    level: number;
    condition: number;
    types: number[];
    catch_rate: number;
    moves: number[];
    ot_id: number;
}

interface PartyPokemon {
    count: number;
    species: number[];
    nicknames: number[][];
}

const convertWithCharMap = (buf: Buffer) => {
    let str = [];
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] == 0xFF) break;
        str.push(GEN_1_CHARACTER_MAP[buf[i]] || '');
    }
    return str.join('');
}

const getSpeciesList = (buf: Buffer) => {
    let str = [];
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] === 0xFF) {
            break;
        } else {
            str.push(GEN_1_POKEMON_MAP[buf[i]] || 'MISSINGNO');
        }
    }
    return str;
}

const parsePartyPokemon = (buf: Buffer) => {
    const pokemon = Buffer.from(buf);
    const species = GEN_1_POKEMON_MAP[pokemon[0x00]];
    const level = pokemon[0x03];
    const type1 = TYPE[pokemon[0x05]];
    const type2 = TYPE[pokemon[0x06]];
    const moves = [
        MOVES_ARRAY[pokemon[0x08]],
        MOVES_ARRAY[pokemon[0x09]],
        MOVES_ARRAY[pokemon[0x0A]],
        MOVES_ARRAY[pokemon[0x0B]]
    ];
    return {
        species,
        level,
        type1,
        type2,
        moves
    }
}

function splitUp(arr, n) {
    var rest = arr.length % n, // how much to divide
        restUsed = rest, // to keep track of the division over the elements
        partLength = Math.floor(arr.length / n),
        result = [];

    for(var i = 0; i < arr.length; i += partLength) {
        var end = partLength + i,
            add = false;

        if(rest !== 0 && restUsed) { // should add one element for the division
            end++;
            restUsed--; // we've used one division element now
            add = true;
        }

        result.push(arr.slice(i, end)); // part of the array

        if(add) {
            i++; // also increment i in the case we added an extra element for division
        }
    }

    return result;
}

const getPokemonListForParty = (buf: Buffer, entries: number = 6) => {
    return parsePartyPokemon(buf);
}

const getPokemonListForBox = (buf: Buffer, entries: number = 6) => {
    const box = splitUp(Buffer.from(buf), entries);

    const pokes = box.map(box => parsePartyPokemon(box));
    

    return pokes;
}

const getPokemonNames = (buf: Buffer, entries: number = 6) => {
    const pokes = splitUp(Buffer.from(buf), entries);
    const names = pokes.map(poke => convertWithCharMap(poke));
    return names;
}

const parsePokemonParty = (buf: Buffer) => {
    const party = Buffer.from(buf);
    const entriesUsed = party[0x0000];
    const rawSpeciesList = party.slice(0x0001,0x0007);
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
    }
}

const parseBoxedPokemon = (buf: Buffer) => {
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
    }
}

const parseTime = (buf: Buffer) => {
    const time = Buffer.from(buf);
    const hours = time[0x01] + time[0x00];
    const minutes = Math.ceil(time[0x02] + (time[0x03] / 60));

    return `${hours}:${minutes}`;
}

export const parseFile = (file) => {


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
    }

    console.log(JSON.stringify(save, null, 2));

    return save;
}

// loadSaveFile('./yellow.sav');

/**
 * Money: 3175
 * Badges: 0?
 * Time: 0:35
 * Name: YELLOW
 * Party: level 11 PIKACHU
 */