# Hero NFT Liquidity Pool

### Setup & Deploy

```sh
yarn

yarn codegen && yarn build

npx graph auth --product hosted-service <AUTH_KEY>

npx graph deploy --product hosted-service heroesofnft/hero-nft-liquidity-pool

```

```
# prepare constants and subgraph.yaml
$ yarn prepare:{network}

# generate Assembly Script typings
$ yarn codegen:{network}

# compile and build files
$ yarn build:{network}

# authenticate api key
$ graph auth

# deploy subgraph
$ yarn deploy:{network}
```

### Setting up local node (for development)

1. Install docker on local machine https://docs.docker.com/get-docker/
2. Run `yarn start:node`
3. Build subgraph: `yarn codegen && yarn build`
4. Create local subgraph: `yarn create-local`
5. Deploy to local node: `yarn deploy-local`
6. Subgraph endpoint available at http://localhost:8000/subgraphs/name/heroesofnft/hero-nft-liquidity-pool
7. To open indexer logs: `docker logs hero_nft_liquidity_pool_indexer -f 2>&1 | grep --line-buffered -i -E --color "WORD_TO_FILTER"`
8. To stop the running containers: `docker rm -f postgres ipfs hero_nft_liquidity_pool_indexer`
