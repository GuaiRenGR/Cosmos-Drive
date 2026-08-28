import { BasePage } from '../../base-page.js'
import IndexComponent from './index.vue'

export default class IndexPage extends BasePage {
  onLoad(options) {
    super.onLoad(options)
    this.setRootComponent(IndexComponent)
  }
}
