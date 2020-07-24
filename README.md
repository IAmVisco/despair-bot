# Despair Bot
A Discord bot to count word matches in messages and emotes and store them in Redis.
Done for English Nakirigumi Discord server since I was bored.  
Server counterpart that serves changes, logged by this bot in real time
with WebSockets can be found [here](https://github.com/IAmVisco/despair-server).

## Installation and usage
Install Redis.  
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
