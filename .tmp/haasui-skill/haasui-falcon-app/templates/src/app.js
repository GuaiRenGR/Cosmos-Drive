import { BasePage } from './base-page.js';

// Replace this from the probed target profile before running on a device.
const DESIGN_WIDTH = 0;

class App extends $falcon.App {
  constructor() {
    super();
  }

  onLaunch(options) {
    super.onLaunch(options);
    if (!DESIGN_WIDTH) throw new Error('Set DESIGN_WIDTH from the target Youdao device profile');
    this.setViewPort(DESIGN_WIDTH);
    $falcon.useDefaultBasePageClass(BasePage);
  }

  onShow() {
    super.onShow();
  }

  onHide() {
    super.onHide();
  }

  onDestroy() {
    super.onDestroy();
  }
}

export default App;
