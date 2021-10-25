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


