# MISO

Miso (みそ or 味噌) is a traditional Japanese seasoning produced by fermenting soybeans with salt and kōji (the fungus Aspergillus oryzae) and sometimes rice, barley, seaweed, or other ingredients.

## Deploy

```sh
hh --network <network> deploy
```

```sh
hh --network <network> deploy --tags Crowdsale
```

## Verification

Verification task will verify all contracts on Etherscan & Tenderly (if supported), given that given that the ETHERSCAN_API_KEY is set in your .env, and you're logged in via the tenderly-cli.

```sh
hh --network ropsten miso:verify
```

Verification for sourcify compatible explorers can be achieved also (example below).

```sh
hh --network celo sourcify --endpoint https://sourcify.dev/server/
```


## Whitelist Process

addMinter on MISOAccessControls will allow a project to mint a token and create an auction.

## Max List Process

- MaxList contract deployed
- initPointList called with admin parameter
- setPoints called with account parameter set to empty array, and amounts set to array with a single amount (amount should be MAX_NUMBER_OF_TOKENS * TOKEN_DECIMALS * PRICE_PER_TOKEN)

## Adding a token

```sh
hh --network kovan add:token --address 0xDB992B1f568C824E3636f98a3783d10c8791C65a
```

## Unlock

```sh
hh --network kovan lock
```

## Lock

```sh
hh --network kovan lock
```