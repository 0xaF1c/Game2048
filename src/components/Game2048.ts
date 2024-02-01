import { getConfig } from "../config";
import { Game2048DataModel } from "../lib/Game2048DataModel";
import { ModelView } from "../lib/modelView";
import { useDebounce } from "../lib/utils";

const { consoleMode } = getConfig()

export class Game2048 extends HTMLElement implements ModelView {

  model: Game2048DataModel
  animationContainer: HTMLDivElement
  stateTip: HTMLDivElement
  moveDelay: number = 150
  mergeDelay: number = 300
  generateDelay: number = 500
  lost: boolean = false
  win: boolean = true

  constructor(model: Game2048DataModel) {
    super()
    this.model = model
    this.animationContainer = document.createElement("div")
    this.stateTip = document.createElement("div")
    this.createFrameFromDataModel()
  }
  move(from: any, to: any, moveDelay: number) {
    const run = useDebounce(() => {
      const li = this.querySelector(`ul li.block[x="${from.x}"][y="${from.y}"]`) as HTMLLIElement
      const toBlock = this.querySelector(`ul li.block[x="${to.x}"][y="${to.y}"]`) as HTMLLIElement
      const animationEl = li.cloneNode() as HTMLLIElement

      toBlock.classList.add('hidden')
      li.classList.add('hidden')

      animationEl.className = 'block-animation block-' + li.value
      animationEl.innerHTML = li.innerHTML
      animationEl.style.left = li.getBoundingClientRect().left.toFixed(4) + 'px'
      animationEl.style.top = li.getBoundingClientRect().top.toFixed(4) + 'px'

      animationEl.style.boxShadow = 'none'
      animationEl.style.width = getComputedStyle(li, null).width
      animationEl.style.height = getComputedStyle(li, null).height
      animationEl.style.transition = `left ${moveDelay * 0.9}ms, top ${moveDelay * 0.9}ms, transform ${moveDelay}ms`
      this.animationContainer.appendChild(animationEl)

      setTimeout(() => {
        const toBlock = this.querySelector(`ul li.block[x="${to.x}"][y="${to.y}"]`) as HTMLLIElement
        const li = this.querySelector(`ul li.block[x="${from.x}"][y="${from.y}"]`) as HTMLLIElement
        toBlock.classList.add('hidden')
        li.classList.add('hidden')
        if (!(
          animationEl.getBoundingClientRect().left === toBlock.getBoundingClientRect().left &&
          animationEl.getBoundingClientRect().top === toBlock.getBoundingClientRect().top
        )) {
          animationEl.style.left = toBlock.getBoundingClientRect().left.toFixed(4) + 'px'
          animationEl.style.top = toBlock.getBoundingClientRect().top.toFixed(4) + 'px'
        }
      })
      setTimeout(() => {
        const toBlock = this.querySelector(`ul li.block[x="${to.x}"][y="${to.y}"]`) as HTMLLIElement
        const li = this.querySelector(`ul li.block[x="${from.x}"][y="${from.y}"]`) as HTMLLIElement
        toBlock.classList.remove('hidden')
        li.classList.remove('hidden')

        animationEl.remove()
        this.update()
      }, moveDelay)
    }, moveDelay)
    run()
  }
  merge(to: any, moveDelay: number) {
    const run = useDebounce(() => {
      setTimeout(() => {
        const li = this.querySelector(`ul li.block[x="${to.x}"][y="${to.y}"]`) as HTMLLIElement
        li.classList.add('merged')

      })
      setTimeout(() => {
        const li = this.querySelector(`ul li.block[x="${to.x}"][y="${to.y}"]`) as HTMLLIElement
        li.classList.remove('merged')
      }, moveDelay)
    }, this.mergeDelay)
    run()
  }
  createFrameFromDataModel(): void {
    this.lost = false
    if (this.model) {
      const data = this.model.getData()

      this.animationContainer.classList.add('animationContainer')
      this.stateTip.classList.add('stateTip')

      this.appendChild(this.animationContainer)
      this.appendChild(this.stateTip)
      let str = ''
      data.forEach((row, y) => {
        const ul = document.createElement("ul")
        let len = ''
        row.forEach(({ value }, x) => {
          const li = document.createElement("li")

          len += `${value} `

          li.innerHTML = value === 0 ? '' : value.toString()
          li.classList.add('block')
          li.classList.add(`block-${value}`)
          li.setAttribute('x', x.toString())
          li.setAttribute('y', y.toString())
          li.setAttribute('value', value.toString())
          ul.appendChild(li)

          if (li.innerHTML !== '') {
            li.classList.add(`block-generate`)
            setTimeout(() => {
              li.classList.remove(`block-generate`)
            }, this.generateDelay)
          }
        })
        this.appendChild(ul)
        len += '\n'
        str += len
      })
      if (consoleMode) {
        console.log(str)
      }
      this.model.on('blockGenerate', (_this: Game2048DataModel, animationData: any) => {
        const { x, y } = animationData
        const li = this.querySelector(`.block[x="${x}"][y="${y}"]`) as HTMLLIElement

        // console.log(x, y)
        
        li.classList.add(`block-generate`)
        setTimeout(() => {
          li.classList.remove(`block-generate`)
        }, 1000)
      })
      this.model.on('move', (_this: any, animationData: any) => {
        const { from, to } = animationData

        this.move(from, to, this.moveDelay)
      })
      this.model.on('merge', (_this: any, animationData: any) => {
        const { from, to } = animationData

        this.move(from[0], to, this.moveDelay)
        this.move(from[1], to, this.moveDelay)
        this.merge(to, this.mergeDelay)

      })
      this.model.on('restart', () => {
        this.update()
      })
      this.model.on('lost', (_this: any, lost: any) => {
        this.lost = lost
        this.update()
      })

    } else {
      throw new Error("DataModel is not defined")
    }
  }

  update(): void {
    const data = this.model.getData()
    let str = ''
    
    
    data.forEach((row, y) => {
      let len = ''
      row.forEach(({ value }, x) => {
        const li = this.querySelector(`ul li.block[x="${x}"][y="${y}"]`) as HTMLLIElement
        const oldClass = `block-${li.value}`
        li.setAttribute('value', value.toString())
        li.classList.replace(oldClass, `block-${li.value}`)
        li.innerHTML = value === 0 ? '' : value.toString()
        len += `${value} `
      })
      len += '\n'
      str += len
    })
    if (consoleMode) {
      console.clear()
      console.log(str)
    }
    if (this.lost) {
      this.stateTip.classList.add('active')
      this.stateTip.innerHTML = 'Game over!'
    } else {
      this.stateTip.classList.remove('active')
    }
  }
}
window.customElements.define("game2048-view", Game2048)