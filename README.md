# discord.js Bot Template
A Discord bot template to quickly get started with developing without a need to set up environment all over again.  

## Features
Tried to keep it rather simple:
- 🐶 Set up ESLint with airbnb ruleset and git hooks
- ⚡ Dynamic command importer
- 😈 Nodemon and ts-node for high-octane developing
- 📜 Ready-to-go winston logger
- 🔧 discord.js types extensions and own types for safety and code completion
- 📓 Auto-generating help with `help` command

Includes few commands in `Meta` group:
- `help` - Prints generated commands list.
- `ping` - Checks Discord pings.

## Installation and usage
Copy `.env.example` into `.env` and set your bot token (acquired [here](https://discord.com/developers/applications)) and bot prefix.

First of all pull npm packages:
```shell script
npm install
```
Starting up for development:
 ```shell script
npm run start
```
Build TS for production.
```shell script
npm run build
```
Resulting build will be in `dist/` directory. You can run either with vanilla node or use something like [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
for careful process and log management.
```shell script
node dist/index.js
# or
pm2 start dist/index.js
```
## License
MIT
