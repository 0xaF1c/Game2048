interface GameConfig {

}
export type BlockData = {
  value: number,
  x: number,
  y: number
}
export type RowData = Array<BlockData>
export type MapData = Array<RowData> 
export type BackStep = {
  // 撤回的数据
  data: string,
  // 下一步的操作函数
  step: Function,
  score: number,
  best: number
}
export type BackData = Array<BackStep>

export type Game2048DataModelEvents =
  'lost' |
  'win' |
  'restart' |
  'start' |
  'left' |
  'right' |
  'up' |
  'down' |
  'blockGenerate' |
  'merge' | 
  'move' |
  'scoreChange' |
  'bestChange'