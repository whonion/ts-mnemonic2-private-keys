import * as fs from 'fs';
import { ethers } from 'ethers';

async function isSeedPhraseValid(seedPhrase: string, reservedWords: Set<string>): Promise<boolean> {
  // Check if the seed phrase has the correct number of words (12 or 24)
  const mnemonicArray = seedPhrase.split(' ');
  if (mnemonicArray.length !== 12 && mnemonicArray.length !== 24) {
    console.log(`Invalid mnemonic: ${seedPhrase}`);
    return false;
  }

  // Check if each word in the seed phrase is a reserved word
  for (const word of mnemonicArray) {
    if (!reservedWords.has(word)) {
      console.log(`Invalid word in mnemonic: ${word}`);
      return false;
    }
  }

  return true;
}

async function convertseedPhrasesToPrivateKeys() {
  try {
    // Check if the seeds.txt file exists
    if (!fs.existsSync('seeds.txt')) {
      console.error('seeds.txt file not found');
      return;
    }

    // Read seed-phrases from the seeds.txt file (each phrase on a new line)
    const seedPhrases: string[] = fs.readFileSync('seeds.txt', 'utf-8').split('\n');
    const privateKeys: string[] = [];

    // Read the reserved words from words.txt into a Set
    const reservedWords: Set<string> = new Set(
      fs.readFileSync('words.txt', 'utf-8').split('\n')
    );

    for (const phrase of seedPhrases) {
      const seedPhrase = phrase.trim(); // Remove leading/trailing spaces
      if (seedPhrase) {
        if (await isSeedPhraseValid(seedPhrase, reservedWords)) {
          // Create a wallet from the seed phrase
          const mnemonicWallet = ethers.Wallet.fromMnemonic(seedPhrase);

          // Add the private key to the list
          privateKeys.push(mnemonicWallet.privateKey);
        } else {
          // Add "none" for invalid seed phrases
          privateKeys.push('none');
        }
      }
    }

    // Write private keys (including "none" for invalid phrases) to private_keys.txt
    fs.writeFileSync('private_keys.txt', privateKeys.join('\n'));

    console.log('Private keys have been written to private_keys.txt');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Run the conversion
convertseedPhrasesToPrivateKeys();
