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

Etherscan Verification happens automatically on deployment given that the ETHERSCAN_API_KEY is set in your .env, Tenderly Verification will also so long as you've logged in with the tenderly-cli.

hh --network ropsten miso:verify

hh --network celo sourcify --endpoint https://sourcify.dev/server/
