import * as fs from 'fs';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { ethers } from 'ethers';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface Arguments {
  evm?: boolean;
  cosmos?: boolean;
  all?: boolean;
  [x: string]: unknown;
}

async function isSeedPhraseValid(seedPhrase: string, reservedWords: Set<string>): Promise<boolean> {
  const mnemonicArray = seedPhrase.split(' ');
  if (mnemonicArray.length !== 12 && mnemonicArray.length !== 24) {
    console.log(`Invalid mnemonic: ${seedPhrase}`);
    return false;
  }

  for (const word of mnemonicArray) {
    if (!reservedWords.has(word.trim())) {
      console.log(`Invalid word in mnemonic: ${word}`);
      return false;
    }
  }

  return true;
}

async function convertEvmSeedPhrasesToPrivateKeys(seedPhrases: string[], reservedWords: Set<string>): Promise<string[]> {
  const privateKeys: string[] = [];
  
  for (const phrase of seedPhrases) {
    const seedPhrase = phrase.trim();
    if (seedPhrase) {
      if (await isSeedPhraseValid(seedPhrase, reservedWords)) {
        const wallet = ethers.Wallet.fromMnemonic(seedPhrase);
        privateKeys.push(wallet.privateKey);
      } else {
        privateKeys.push('none');
      }
    }
  }

  return privateKeys;
}

async function convertCosmosSeedPhrasesToPrivateKeys(seedPhrases: string[], reservedWords: Set<string>): Promise<string[]> {
  const privateKeys: string[] = [];

  for (const phrase of seedPhrases) {
    const seedPhrase = phrase.trim();
    if (seedPhrase) {
      if (await isSeedPhraseValid(seedPhrase, reservedWords)) {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(seedPhrase);
        const accountsWithPrivkeys = await (wallet as any).getAccountsWithPrivkeys();
        const privKey = accountsWithPrivkeys[0].privkey;
        privateKeys.push(Buffer.from(privKey).toString('hex'));
      } else {
        privateKeys.push('none');
      }
    }
  }

  return privateKeys;
}

async function run() {
  const argv = yargs(hideBin(process.argv))
    .option('evm', {
      type: 'boolean',
      description: 'Process EVM seed phrases',
    })
    .option('cosmos', {
      type: 'boolean',
      description: 'Process Cosmos seed phrases',
    })
    .option('all', {
      type: 'boolean',
      description: 'Process both EVM and Cosmos seed phrases',
    })
    .argv as Arguments;

  const doEvm = argv.evm || argv.all;
  const doCosmos = argv.cosmos || argv.all;

  if (!doEvm && !doCosmos) {
    console.error('Please specify --evm, --cosmos, or --all.');
    process.exit(1);
  }

  let seedPhrases: string[];
  let reservedWords: Set<string>;

  try {
    seedPhrases = fs.readFileSync('seeds.txt', 'utf-8').split('\n');
  } catch (error:any) {
    if (error.code === 'ENOENT') {
      console.error('Error: seeds.txt file not found.');
    } else {
      console.error('Error reading seeds.txt:', error);
    }
    process.exit(1);
  }

  try {
    reservedWords = new Set(
      fs.readFileSync('words.txt', 'utf-8').split('\n').map(word => word.trim())
    );
  } catch (error:any) {
    if (error.code === 'ENOENT') {
      console.error('Error: words.txt file not found.');
    } else {
      console.error('Error reading words.txt:', error);
    }
    process.exit(1);
  }

  if (doEvm) {
    try {
      const evmPrivateKeys = await convertEvmSeedPhrasesToPrivateKeys(seedPhrases, reservedWords);
      fs.writeFileSync('private_keys_evm.txt', evmPrivateKeys.join('\n'));
      console.log('EVM private keys have been written to private_keys_evm.txt');
    } catch (error) {
      console.error('Error processing EVM seed phrases:', error);
    }
  }

  if (doCosmos) {
    try {
      const cosmosPrivateKeys = await convertCosmosSeedPhrasesToPrivateKeys(seedPhrases, reservedWords);
      fs.writeFileSync('private_keys_cosmos.txt', cosmosPrivateKeys.join('\n'));
      console.log('Cosmos private keys have been written to private_keys_cosmos.txt');
    } catch (error) {
      console.error('Error processing Cosmos seed phrases:', error);
    }
  }
}

run().catch(error => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});
