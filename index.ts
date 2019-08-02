import { loadGen1SaveFile } from './gen1';

export * from './gen1';

if (process.argv[2] === 'test') {
    loadGen1SaveFile('./yellow.sav');
    loadGen1SaveFile('./blue.sav');
}