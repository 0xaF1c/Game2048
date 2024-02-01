import { BlockData, MapData } from ".."
import { getConfig } from "../config"

export function getRandomNumber(max: number = 1, min: number = 0, isFloor: Boolean = false) {
  const number = Math.random() * (max - min) + min

  return isFloor ? Math.floor(number) : number
}

type ISelectorColumnResult = Array<{ el: Element, value: number }>
export function selectColumnEl(row: number): ISelectorColumnResult {
  const { size } = getConfig()
  const result: ISelectorColumnResult = []
  for (let i = 0; i < size.y; i++) {
    const li = document.querySelector(`ul li[y="${i}"][x="${row}"]`)
    console.log(i, row)

    result.push({ el: li!, value: Number(li!.textContent!) })
  }
  return result
}
export function selectRowEl(column: number): ISelectorColumnResult {
  const { size } = getConfig()
  const result: ISelectorColumnResult = []
  for (let i = 0; i < size.x; i++) {
    const li = document.querySelector(`ul li[y="${column}"][x="${i}"]`)
    result.push({ el: li!, value: Number(li!.textContent!) })
  }
  return result
}
export function selectColumn(row: number, data: MapData): BlockData[] {
  const { size } = getConfig()
  const result: BlockData[] = []
  for (let i = 0; i < size.y; i++) {
    result.push(data[i][row])
  }
  return result
}
export function setColumn(row: number, newRow: BlockData[], data: MapData) {
  const { size } = getConfig()

  for (let i = 0; i < size.y; i++) {
    data[i][row] = newRow[i]
  }
}
export function selectRow(column: number, data: MapData): BlockData[] {
  const { size } = getConfig()
  const result: BlockData[] = []
  for (let i = 0; i < size.x; i++) {
    result.push(data[column][i])
  }
  return result
}
export function fillToTarget(arr: BlockData[], target: BlockData[]): BlockData[] {
  return target.map((_v, i) => arr[i] ?? { value: 0 })
}

export function equalArrays(a: BlockData[][], b: BlockData[][]): boolean {
  let result = true
  a.forEach((row, i) => {
    row.forEach(({value}, j) => {
      if (b[i][j].value !== value) {
        result = false
      }
    })
  })
  return result
}

type ISelectZeroCoordinatesResult =  { x: number, y: number }
export function selectZeroCoordinates(arr: MapData): ISelectZeroCoordinatesResult {
  let result: ISelectZeroCoordinatesResult[] = [];

  for (let y = 0; y < arr.length; y++) {
    for (let x = 0; x < arr[y].length; x++) {
      if (arr[y][x].value === 0) {
        result.push({x, y})
      }
    }
  }
  
  return result[Math.floor(Math.random() * result.length)]
}
export function isLost(arr: MapData): boolean {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      if (
        (i < arr.length - 1 && arr[i + 1][j].value === arr[i][j].value) ||
        (j < arr[i].length - 1 && arr[i][j + 1].value === arr[i][j].value) ||
        (arr[i][j].value === 0)
      ) {
        return false;
      }
    }
  }
  return true;
}

export function useDebounce(func: Function, delay: number) {
  let canExec = true
  let timer: any = setTimeout(() => {
    canExec = true
    
  }, delay)
  return function () {
    clearTimeout(timer);
    if (canExec) {
      func()
      canExec = false
    }
  };
}

// https://segmentfault.com/q/1010000042957152
export function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     // @ts-ignore
     (navigator.msMaxTouchPoints > 0))
}