import { Game2048DataModel } from "./Game2048DataModel"

export interface ModelView extends HTMLElement {
  
  model: Game2048DataModel | undefined

  /**
   * create view frame from DataModel
   */
  createFrameFromDataModel(): void

  /**
   * update view
   */
  update(): void
}