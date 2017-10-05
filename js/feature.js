import {Element} from './bram.js';

function find(arr, fn) {
  return arr.filter(fn)[0];
}

class ModuleFeature extends Element {
  static get template() {
    return '#feature-tmpl';
  }

  static get observedProperties() {
    return ['feature']
  }

  get browsers() {
    let feature = this.feature;
    if(!this.feature) return [];

    let b = ["Chrome", "Firefox", "Safari", "Edge"].map(name => {
      let browser = find(feature, b => b.name === name);
      let classes = ["browser", browser.supported ? "supported" :
        browser.inProgress ? "in-progress": ""];

      return {
        browser: name,
        classes: classes.join(' '),
        img: `./img/${name.toLowerCase()}.png`
      };
    });

    return b;
  }
}

customElements.define('module-feature', ModuleFeature);
