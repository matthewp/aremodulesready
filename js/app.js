import {Element} from './bram.js';
import { chrome, firefox, edge, safari } from './browsers.js';
import './feature.js';

class AreModulesReady extends Element {
  static get template() {
    return '#app-tmpl';
  }

  constructor() {
    super();
    this.model.script = [chrome(true), firefox(true),
      edge(true), safari(true)];
    this.model.workers = [chrome(false, true, true), firefox(false),
      edge(false), safari(false)];
    this.model.dynamic = [chrome(true), firefox(false),
    this.model.metaUrl = [chrome(true), firefox(false),
      edge(false, true, true), safari(true)];
      edge(false), safari(true)];
  }
}

customElements.define('are-modules-ready', AreModulesReady);
