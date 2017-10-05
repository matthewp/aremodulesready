import fritz, { Component } from 'fritz';
import { chrome, firefox, edge, safari } from './browsers.js';
import styles from './app.css';
import './feature.js';

class AreModulesReady extends Component {
  constructor() {
    super();
    this.script = [chrome(true, true), firefox(false, true, true),
      edge(false, true, true), safari(true)];
    this.workers = [chrome(false), firefox(false),
      edge(false), safari(false)];
    this.dynamic = [chrome(true, false), firefox(false),
      edge(false), safari(false, true, true)];
  }

  render() {
    const { script, workers, dynamic } = this;

    return (
      <main>
        <style>{styles}</style>
        <h1 class="title">Are Modules Ready?</h1>

        <article class="features">
          <module-feature feature={script}>
            <h2 slot="label">&lt;script type="module"&gt;</h2>
            <p slot="desc">The ability to load a module and its dependencies from a &lt;script&gt; tag.</p>
            <section slot="notes">
              <div class="note"><strong>Chrome</strong>: Available in Chrome 61.</div>
              <div class="note"><strong>Firefox</strong>: Available in Firefox 54 behind a flag. In about:config search for <em>dom.moduleScripts.enabled</em> and set to true.</div>
              <div class="note"><strong>Safari</strong>: Available in Safari 10.1.</div>
              <div class="note"><strong>Edge</strong>: Available via the Windows Insider Program.</div>
            </section>
          </module-feature>

          <module-feature feature={workers}>
            <h2 slot="label">Worker modules</h2>
            <p slot="desc">Create Web Workers that are modules (and are able to import other modules) using <code>new Worker(path,  type: "module") </code></p>
            <section slot="notes">
              <div class="note"><strong>Chrome</strong>: <a href="https://bugs.chromium.org/p/chromium/issues/detail?id=680046">Not yet in progress</a>.</div>
              <div class="note"><strong>Firefox</strong>: <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1247687">Not yet in progress</a>.</div>
              <div class="note"><strong>Safari</strong>: Not yet implemented.</div>
              <div class="note"><strong>Edge</strong>: Not yet implemented.</div>
            </section>
          </module-feature>

          <module-feature feature={dynamic}>
            <h2 slot="label">import()</h2>
            <p slot="desc">Provides the ability to dynamically import a module from within a module or a script. <a href="https://tc39.github.io/proposal-dynamic-import/">Spec</a>.</p>
            <section slot="notes">
              <div class="note"><strong>Chrome</strong>: Available in Chrome 63.</div>
              <div class="note"><strong>Firefox</strong>: <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1342012">Not yet in progress</a>.</div>
              <div class="note"><strong>Safari</strong>: Available in Safari Technology Preview.</div>
              <div class="note"><strong>Edge</strong>: Not yet implemented.</div>
            </section>
          </module-feature>
        </article>

        <div class="closing">We are getting there 🤠!</div>
      </main>
    );
  }
}

fritz.define('are-modules-ready', AreModulesReady);
