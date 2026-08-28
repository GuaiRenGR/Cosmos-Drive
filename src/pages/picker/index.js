import { BasePage } from '../../base-page.js'
import IndexComponent from '../index/index.vue'

export default class PickerPage extends BasePage {
  onLoad(options) {
    super.onLoad(options)
    this.setRootComponent(IndexComponent)
  }
}
