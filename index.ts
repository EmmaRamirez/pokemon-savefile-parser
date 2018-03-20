import { loadGen1SaveFile } from '.';

export * from './gen1';

const r = loadGen1SaveFile('./yellow.sav', 'nuzlocke').then(r => console.log(r));