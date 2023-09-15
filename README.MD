## mnemonic2private-key
Async converter of mnemonic phrases to private keys

### Install `Node.js`
```sh
sudo apt install git
sudo apt install nodejs
sudo apt install npm
node -v
npm -v
```
### Clone repo and install dependencies
```sh
git clone https://github.com/whonion/ts-mnemonic2private-key.git
cd ts-mnemonic2private-key
npm i
npm i -g typescript
tsc --project tsconfig.json
```
**Load the seed phrases into the `seeds.txt` file (12 or 24 words)**

Each seed phrase must start on a new line

### Run Script
```sh
node main.js
```
