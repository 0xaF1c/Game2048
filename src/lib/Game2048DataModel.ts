import { BackData, BlockData, Game2048DataModelEvents, MapData } from "../index"
import { equalArrays, fillToTarget, selectColumn, setColumn, selectZeroCoordinates, isLost } from "./utils"
import { getConfig } from "../config"

const { doubleGenerate, size, maxBlock, maxBlockGenerate, minBlock, storageKey } = getConfig()

export class Game2048DataModel {

  data: MapData = []
  backData: BackData = []
  score: number = 0
  best: number = 0
  lost: boolean = false
  win: boolean = false

  step: Function = () => {
    console.error('no more step')
    throw 'no more step'
  }
  stack: number = 0
  eventList: Record<Game2048DataModelEvents, Function> = {
    lost(){},
    win(){},
    restart(){},
    start(){},
    left(){},
    right(){},
    up(){},
    down(){},
    blockGenerate(){},
    merge(){},
    move(){},
    scoreChange() {},
    bestChange() {}
  }

  constructor() {
    this.initData()
  }
  resetPosition() {
    for (let y = 0; y < size.y; y++) {
      for (let x = 0; x < size.x; x++) {
        const block = this.data[y][x]
        block.x = x
        block.y = y
      }
    }
  }

  getData() {
    return this.data
  }
  getBackData() {
    return JSON.parse(this.backData[this.backData.length - 1].data)
  }
  useStep(cb: Function) {
    const run = () => {
      cb()
      
      if (isLost(this.data)) {
        this.lost = true
        this.emit('lost', this.lost)
      }
      if (!equalArrays(this.data, this.getBackData())) {
        this.generateBlock()
        if (Math.random() < doubleGenerate) {
          this.generateBlock()
        }
      }
      this.resetPosition()
    }
    this.backData.push({
      data: JSON.stringify(this.data),
      step: run,
      score: this.score,
      best: this.best,
    })
    if (!(this.lost || this.win)) {
      run()
      this.save()
    }
  }

  sum(arr: BlockData[]): BlockData[] {
    const result: BlockData[] = []
    const list = arr.filter(({value}) => value !== 0)

    list.forEach((block, i) => {
      if (block.value === list[i + 1]?.value) {
        const sumValue = block.value * 2
        result.push({ value: sumValue, x: 0, y: 0 })

        this.score += sumValue
        if (this.score > this.best) {
          this.best = this.score
          this.emit('bestChange', this.best)
        }
        this.emit('scoreChange', this.score)
        this.emit('merge', {
          from: JSON.parse(JSON.stringify([ block, list[i + 1]])),
          to: result[result.length - 1],
          type: 'merge'
        })
        
        list[i + 1].value = 0
        list[i].value = 0
      } else if (block.value !== 0 && block.value !== list[i - 1]?.value) {        
        this.emit('move', {
          from: JSON.parse(JSON.stringify(block)),
          to: block,
          type: 'move'
        })
        
        result.push(block)
      }
    })

    // if (list.includes(win)) {
    //   this.emit('win')
    // }
    return fillToTarget(result, arr)
  }
  left() {
    this.useStep(() => {
      this.data.forEach((row, y) => {
        const rowData = this.sum(row)
        
        this.data[y] = rowData
      })
      this.emit('left')
    })
  }
  right() {
    this.useStep(() => {
      this.data.forEach((row, y) => {
        const rowData = this.sum(row.reverse())

        this.data[y] = rowData.reverse()
      })
      this.emit('right')
    })
  }
  up() {
    this.useStep(() => {
      for (let i = 0; i < size.x; i++) {
        const rowData = this.sum(selectColumn(i, this.data))
        setColumn(i, rowData, this.data)
      }
      this.emit('up')
    })
  }
  down() {
    this.useStep(() => {
      for (let i = 0; i < size.x; i++) {
        const rowData = this.sum(selectColumn(i, this.data).reverse())
        setColumn(i, rowData.reverse(), this.data)
      }
      this.emit('down')
    })
  }
  goBack() {
    if (this.backData.length > 0) {
      this.data = this.getBackData()
      this.step = this.backData[this.backData.length - 1].step
      this.best = this.backData[this.backData.length - 1].best
      this.score = this.backData[this.backData.length - 1].score
      this.backData.pop()
      this.emit('scoreChange', this.score)
      this.emit('bestChange', this.best)
    } else {
      console.error('no more back')
      throw 'no more back'
    } 
  }
  unBack() {
    this.step()
  }

  
  on(event: Game2048DataModelEvents, callback: any) {    
    this.eventList[event] = callback
  }
  emit(event: Game2048DataModelEvents, ...args: any[]) {
    this.eventList[event](this, ...args)
  }


  generateBlock() {
    const number = Math.random() > maxBlockGenerate ? minBlock : maxBlock
    const position = selectZeroCoordinates(this.data)
    
    if (position) {
      const {x , y} = position
      
      this.data[y][x] = { value: number, x, y}
      
      this.emit('blockGenerate', {
        x,
        y,
        value: number
      })
    }
  }

  /**
   * @param size { x: number, y: number}
   */
  initData(force?: boolean) {
    const storage = localStorage.getItem(storageKey)
    const init = () => {
      
      this.data = []
      this.backData = []
      this.score = 0
      this.lost = false
      this.win = false
      for (let y = 0; y < size.y; y++) {
        const row = []
        for (let x = 0; x < size.x; x++) {
          row.push({
            value: 0,
            x,
            y
          })
        }
        this.data.push(row)
      }
      this.generateBlock()
      this.generateBlock()
    }
    
    if (storage === null || force){
      init()
    } else {
      const parsed = JSON.parse(storage)
      
      if (parsed === null || parsed?.mapData === undefined) {
        init()
      } else {
        this.data = parsed?.mapData
        this.backData = parsed?.backData ?? []
        this.score = parsed?.score ?? 0
        this.best = parsed?.best ?? 0
      }
    }

  }
  save() {
    localStorage.setItem(storageKey, JSON.stringify({
      best: this.best,
      score: this.score,
      mapData: this.data,
      backData: this.backData,
    }))
  }
  gameRestart() {
    this.initData(true)
    this.save()
    this.emit('lost', this.lost)
    this.emit('restart')
    this.emit('scoreChange', this.score)
    this.emit('bestChange', this.best)
  }

}