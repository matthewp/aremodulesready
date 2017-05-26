import fritz, { Component } from 'fritz';
import styles from './feature.css';

function find(arr, fn) {
  return arr.filter(fn)[0];
}

class ModuleFeature extends Component {
  static get props() {
    return {
      feature: {}
    };
  }

  render() {
    let feature = this.feature;

    if(!feature) {
      return <div></div>;
    }

    return (
      <article>
        <style>{styles}</style>

        <div class="arm">
          <header class="feature">
            <slot name="label"></slot>
            <slot name="desc"></slot>
          </header>
          <div class="results">
            <ul class="browsers">
              {["Chrome", "Firefox", "Safari", "Edge"].map(name => {
                let browser = find(feature, b => b.name === name);
                let classes = ["browser", browser.supported ? "supported" : ""]
                return (
                  <li class={classes.join(' ')}>
                    <img src={`/img/${name.toLowerCase()}.png`} title={name} />
                  </li>
                )
              })}
            </ul>
            <slot name="notes"></slot>
          </div>
        </div>
      </article>
    )
  }
}

fritz.define('module-feature', ModuleFeature);