import ChainApis from "./chainApis.js";
import ChainAsset from './chainAsset.js'

const CONSENSUS_PREFIXES = {
  cryptoorgchain: 'crocnclcons'
}

function Chain(client, data, paramsData) {
  const { path, chain, assetlist } = data;
  const { params, services, prices } = paramsData

  chain.name = chain.chain_name
  const coingecko = prices?.coingecko || {}
  const assets = assetlist && assetlist.assets.map(asset => {
    const price = coingecko[asset.display]

    return ChainAsset(asset, price && { coingecko: price })
  });
  const baseAsset = assets && assets[0]

  const prefix = chain.bech32_prefix
  const consensusPrefix = CONSENSUS_PREFIXES[path] || `${prefix}valcons`

  async function apis(type){
    const health = await apiHealth(type)
    return ChainApis(chain.apis || {}, health)
  }
  
  async function apiHealth(type) {
    const healthPath = {}
    if(type){
      healthPath.path = [
        '$.' + type,
      ]
    }
    const health = await client.json.get('health:' + path, healthPath) || {}
    return type ? {[type]: health[0]} : health
  }

  function getDataset(dataset){
    dataset = ['path'].includes(dataset) ? undefined : dataset
    return dataset && data[dataset]
  }

  return {
    path: path,
    chainId: chain.chain_id,
    name: chain.name,
    prettyName: chain.pretty_name,
    denom: baseAsset?.denom,
    symbol: baseAsset?.symbol,
    decimals: baseAsset?.decimals,
    coingeckoId: baseAsset?.coingecko_id,
    baseAsset,
    assets,
    prefix,
    consensusPrefix,
    ...data,
    params,
    services,
    prices,
    apis,
    getDataset
  };
}

export default Chain
