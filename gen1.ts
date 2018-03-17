import * as fs from 'fs';

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
    POKEMON_PC_SECOND_HALF  : 0x6000
};

const checksum = (data: Uint8Array) => {
    let checksum_n = 255;
    for (let i = 0x2598; i < OFFSETS.CHECKSUM; ++i) {
        checksum_n -= data[i];
    }
    return checksum_n;
}

const loadSaveFile = (filename: string) => {
    fs.readFile(filename, (err, data) => {
        if (err) throw err;
        const file = Buffer.from(data);
        parseFile(file);
        console.log('file', file);
    });


}

const convertTextToUTF8 = (inputBuffer, outputText, numChars) => {

}

const TYPE = {
    NORMAL   : 0x00,
    FIGHTING : 0x01,
    FLYING   : 0x02,
    POISON   : 0x03,
    GROUND   : 0x04,
    ROCK     : 0x05,
    BUG      : 0x07,
    GHOST    : 0x08,
    FIRE     : 0x14,
    WATER    : 0x15,
    GRASS    : 0x16,
    ELECTRIC : 0x17,
    PSYCHIC  : 0x18,
    ICE      : 0x19,
    DRAGON   : 0x1A
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

const CHARACTER_MAP = {
    0x80: 'A',
    0x81: 'B',
    0x82: 'C',
    0x83: 'D',
    0x84: 'E',
    0x85: 'F',
    0x86: 'G',
    0x87: 'H',
    0x88: 'I',
    0x89: 'J',
    0x8A: 'K',
    0x8B: 'L',
    0x8C: 'M',
    0x8D: 'N',
    0x8E: 'O',
    0x8F: 'P',
    0x90: 'Q',
    0x91: 'R',
    0x92: 'S',
    0x93: 'T',
    0x94: 'U',
    0x95: 'V',
    0x96: 'W',
    0x97: 'X',
    0x98: 'Y',
    0x99: 'Z',
    0x9A: '(',
    0x9B: ')',
    0x9C: ':',
    0x9D: ';',
    0x9E: '[',
    0x9F: ']',
    0xA0: 'a',
    0xA1: 'b',
    0xA2: 'c',
    0xA3: 'd',
    0xA4: 'e',
    0xA5: 'f',
    0xA6: 'g',
    0xA7: 'h',
    0xA8: 'i',
    0xA9: 'j',
    0xAA: 'k',
    0xAB: 'l',
    0xAC: 'm',
    0xAD: 'n',
    0xAE: 'o',
    0xAF: 'p',
    0xB0: 'q',
    0xB1: 'r',
    0xB2: 's',
    0xB3: 't',
    0xB4: 'u',
    0xB5: 'v',
    0xB6: 'w',
    0xB7: 'x',
    0xB8: 'y',
    0xB9: 'z',
    0xBA: 'é',
    0xBB: '\'d',
    0xBC: '\'l',
    0xBD: '\'s',
    0xBE: '\'t',
    0xBF: '\'v',
    0xEF: '♂',
    0xE0: '\'',
    0xE4: '-',
    0xE7: '?',
    0xE8: '!',
    0xE9: '.',
    0xF2: '.',
    0xF3: '/',
    0xF4: ',',
    0xF5: '♀',
    0xF6: '0',
    0xF7: '1',
    0xF8: '2',
    0xF9: '3',
    0xFA: '4',
    0xFB: '5',
    0xFC: '6',
    0xFD: '7',
    0xFE: '8',
    0xFF: '9' 
}

const convertTrainerName = (buf: Buffer) => {
    let str = [];
    for (let i = 0; i < 11; i++) {
        str.push(CHARACTER_MAP[buf[i]] || '');
    }
    return str.join('');
}

const parseFile = (file) => {


    const yellow = file[OFFSETS.PIKACHU_FRIENDSHIP] > 0;
    const trainerName = convertTrainerName(file.slice(OFFSETS.PLAYER_NAME, OFFSETS.PLAYER_NAME + 11));
    const trainerID = file[OFFSETS.PLAYER_ID];
    const money = file[OFFSETS.MONEY];
    const pokemonParty = file[OFFSETS.POKEMON_PARTY];

    // const ellow = file[0];

    const save = {
        yellow,
        trainerName,
        trainerID,
        money,
        pokemonParty,
    }

    console.log(save);

    return save;
}

loadSaveFile('./yellow.sav');

/**
 * Money: 3175
 * Badges: 0?
 * Time: 0:35
 * Name: YELLOW
 * Party: level 11 PIKACHU
 */