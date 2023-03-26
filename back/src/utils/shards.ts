export const SHARD_LIMIT = 5;

export const getShardNumber = () => {
  return Math.floor(Math.random() * SHARD_LIMIT);
}
