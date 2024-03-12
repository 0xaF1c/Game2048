
import './style.css'

import { Game2048DataModel } from './lib/Game2048DataModel'
import { Game2048 } from './components/Game2048'
// @ts-ignore
import ZingTouch from 'zingtouch'
import { isTouchDevice } from './lib/utils'
import { getConfig } from './config'

const { storageKey } = getConfig()

const root = document.querySelector<HTMLDivElement>('#app')

const model = new Game2048DataModel()

const view = new Game2048(model)
root?.appendChild(view)
view.update()

const resizeUpdate = () => {
  const menu = document.querySelector('.menu') as HTMLDivElement
  const h1 = document.querySelector('h1') as HTMLDivElement
  const stateTip = document.querySelector('.stateTip') as HTMLDivElement
  const blocks = document.querySelectorAll('game2048-view > ul > li.block')
  menu.style.width = getComputedStyle(view, null).width
  h1.style.width = getComputedStyle(view, null).width
  view.style.height = getComputedStyle(view, null).width
  stateTip.style.width = getComputedStyle(view, null).width
  stateTip.style.height = getComputedStyle(view, null).height
  blocks.forEach((_el) => {
    const el = _el as HTMLLIElement
    el.style.fontSize = (el.offsetWidth * 0.33) + 'px'
    
  })
  console.log(view.offsetWidth);
  
  if (view.offsetWidth <= 475) {
    const menu = document.querySelector('.menu')! as HTMLDivElement
    menu.classList.add('wrap')
    h1.classList.add('rotate')
  } else {
    const menu = document.querySelector('.menu')! as HTMLDivElement
    menu.classList.remove('wrap')
    h1.classList.remove('rotate')
  }
}

window.addEventListener('resize', resizeUpdate)
resizeUpdate()

const reStart = () => {
  model.gameRestart()
  view.update()
}
const goBack = () => {
  model.goBack()
  view.update()
}
let clickCount = 0
const resetBest = () => {
  clickCount++
  if (clickCount >= 10) {
    const storageStr = localStorage.getItem(storageKey) ?? ''
    if (storageStr !== '') {
      const storage = JSON.parse(storageStr)
      storage.best = 0
      model.best = 0
      bestEl.innerHTML = '0'
      clickCount = 0
      localStorage.setItem(storageKey, JSON.stringify(storage))
    }
  }
}
const reStartEl = document.querySelector('#restart')!
const goBackEl = document.querySelector('#goBack')!
const bestEl = document.querySelector('#best')!
const scoreEl = document.querySelector('#score')!

const zt = new ZingTouch.Region(document.body)
const swipe = new ZingTouch.Swipe({
	numInputs: 1,
	maxRestTime: 100,
	escapeVelocity: 0.25,
});
zt.bind(document.body, swipe, (e: any) => {
  const deg = e.detail.data[0].currentDirection
  const diff = (target_deg: number, diffValue: number) => deg > target_deg - diffValue && deg < target_deg + diffValue
  if (diff(180, 55)) {
    model.left()
  } else if (diff(270, 70)) {
    model.down()
  } else if (diff(360, 55)) {
    model.right()
  } else if (diff(90, 70)) {
    model.up()
  }
})
if (isTouchDevice()) {
  zt.bind(reStartEl, 'tap', reStart)
  zt.bind(goBackEl, 'tap', goBack)
  zt.bind(bestEl, 'tap', resetBest)
}
reStartEl.addEventListener('click', reStart)
goBackEl.addEventListener('click', goBack)
bestEl.addEventListener('click', resetBest)
scoreEl.innerHTML = model.score+''
bestEl.innerHTML = model.best+''




model.on('scoreChange', (_this: any, score: any) => {
  document.querySelector('#score')!.innerHTML = score
})
model.on('bestChange', (_this: any, best: any) => {
  document.querySelector('#best')!.innerHTML = best
})

const controller: any = {
  w: () => {
    model.up()
  },
  a: () => {
    model.left()
  },
  s: () => {
    model.down()
  },
  d: () => {
    model.right()
  },
  'ctrl+z': () => {
    model.goBack()
    view.update()
  },
  'ctrl+r': () => {
    model.gameRestart()
  }
}

window.addEventListener('keydown', (event) => {
  const fn = controller[`${event.ctrlKey?'ctrl+':''}${event.key}`]
  if (fn) {
    event.preventDefault()
    fn()
  }
})
