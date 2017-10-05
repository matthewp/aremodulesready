import {Element} from './bram.js';
import { chrome, firefox, edge, safari } from './browsers.js';
import './feature.js';

class AreModulesReady extends Element {
  static get template() {
    return '#app-tmpl';
  }

  constructor() {
    super();
    this.model.script = [chrome(true, true), firefox(false, true, true),
      edge(false, true, true), safari(true)];
    this.model.workers = [chrome(false), firefox(false),
      edge(false), safari(false)];
    this.model.dynamic = [chrome(true, false), firefox(false),
      edge(false), safari(false, true, true)];
  }
}

customElements.define('are-modules-ready', AreModulesReady);
