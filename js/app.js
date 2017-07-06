(function () {
'use strict';

const DEFINE = 'define';
const TRIGGER = 'trigger';
const RENDER = 'render';
const EVENT = 'event';
const STATE = 'state';

class Component {
  dispatch(ev) {
    let id = this._fritzId;
    postMessage({
      type: TRIGGER,
      event: ev,
      id: id
    });
  }

  update() {
    let id = this._fritzId;
    postMessage({
      type: RENDER,
      id: id,
      tree: this.render()
    });
  }
}

let Store;
let Handle;

Store = class {
  constructor() {
    this.handleMap = new WeakMap();
    this.idMap = new Map();
    this.id = 0;
  }

  from(fn) {
    let handle;
    let id = this.handleMap.get(fn);
    if(id == null) {
      id = this.id++;
      handle = new Handle(id, fn);
      this.handleMap.set(fn, id);
      this.idMap.set(id, handle);
    } else {
      handle = this.idMap.get(id);
    }
    return handle;
  }

  get(id) {
    return this.idMap.get(id);
  }
};

Handle = class {
  static get store() {
    if(!this._store) {
      this._store = new Store();
    }
    return this._store;
  }

  static from(fn) {
    return this.store.from(fn);
  }

  static get(id) {
    return this.store.get(id);
  }

  constructor(id, fn) {
    this.id = id;
    this.fn = fn;
  }
};

var Handle$1 = Handle;

const eventAttrExp = /^on[A-Z]/;

function signal(tagName, attrName, attrValue, attrs) {
  if(eventAttrExp.test(attrName)) {
    let eventName = attrName.toLowerCase();
    let id = Handle$1.from(attrValue).id;
    return [1, eventName, id];
  }
}

class Tree extends Array {}

function h(tag, attrs, children){
  const argsLen = arguments.length;
  if(argsLen === 2) {
    if(typeof attrs !== 'object' || Array.isArray(attrs)) {
      children = attrs;
      attrs = null;
    }
  } else if(argsLen > 3 || (children instanceof Tree) ||
    typeof children === 'string') {
    children = Array.prototype.slice.call(arguments, 2);
  }

  var isFn = typeof tag === 'function';

  if(isFn) {
    var localName = tag.prototype.localName;
    if(localName) {
      return h(localName, attrs, children);
    }

    return tag(attrs || {}, children);
  }

  var tree = new Tree();
  if(attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function(acc, key){
      var value = attrs[key];

      var eventInfo = signal(tag, key, value, attrs);
      if(eventInfo) {
        if(!evs) evs = [];
        evs.push(eventInfo);
      } else {
        acc.push(key);
        acc.push(value);
      }

      return acc;
    }, []);
  }

  var open = [1, tag];
  if(attrs) {
    open.push(attrs);
  }
  if(evs) {
    open.push(evs);
  }
  tree.push(open);

  if(children) {
    children.forEach(function(child){
      if(typeof child === "string") {
        tree.push([4, child]);
        return;
      }

      while(child && child.length) {
        tree.push(child.shift());
      }
    });
  }

  tree.push([2, tag]);

  return tree;
}

class Serializable {
  serialize() {
    let out = Object.create(null);
    return Object.assign(out, this);
  }
}

class Event extends Serializable {
  constructor(type) {
    super();
    this.type = type;
    this.defaultPrevented = false;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

function getInstance(fritz, id){
  return fritz._instances[id];
}

function setInstance(fritz, id, instance){
  fritz._instances[id] = instance;
}

function render(fritz, msg) {
  let id = msg.id;
  let props = msg.props || {};

  let instance = getInstance(fritz, id);
  let events;
  if(!instance) {
    let constructor = fritz._tags[msg.tag];
    instance = new constructor();
    Object.defineProperty(instance, '_fritzId', {
      enumerable: false,
      value: id
    });
    setInstance(fritz, id, instance);
    events = constructor.observedEvents;
  }

  Object.assign(instance, props);

  let tree = instance.render();
  postMessage({
    type: RENDER,
    id: id,
    tree: tree,
    events: events
  });
}

function trigger(fritz, msg){
  let inst = getInstance(fritz, msg.id);
  let response = Object.create(null);

  let method;
  if(msg.handle != null) {
    method = Handle$1.get(msg.handle).fn;
  } else {
    let methodName = 'on' + msg.name[0].toUpperCase() + msg.name.substr(1);
    method = inst[methodName];
  }

  if(method) {
    let event = new Event(msg.name);
    event.value = msg.value;

    method.call(inst, event);
    response.type = RENDER;
    response.id = msg.id;
    response.tree = inst.render();
    response.event = event.serialize();
    postMessage(response);
  } else {
    // TODO warn?
  }
}

let hasListened = false;

function relay(fritz) {
  if(!hasListened) {
    hasListened = true;

    self.addEventListener('message', function(ev){
      let msg = ev.data;
      switch(msg.type) {
        case RENDER:
          render(fritz, msg);
          break;
        case EVENT:
          trigger(fritz, msg);
          break;
        case STATE:
          fritz.state = msg.state;
          break;
      }
    });
  }
}

const fritz = Object.create(null);
fritz.Component = Component;
fritz.define = define;
fritz.h = h;
fritz._tags = Object.create(null);
fritz._instances = Object.create(null);

function define(tag, constructor) {
  if(constructor === undefined) {
    throw new Error('fritz.define expects 2 arguments');
  }

  fritz._tags[tag] = constructor;

  Object.defineProperty(constructor.prototype, 'localName', {
    enumerable: false,
    value: tag
  });

  relay(fritz);

  postMessage({
    type: DEFINE,
    tag: tag,
    props: constructor.props
  });
}

let state;
Object.defineProperty(fritz, 'state', {
  set: function(val) { state = val; },
  get: function() { return state; }
});

function browser(name) {
  return function (supported, flag, inProgress) {
    return { name, supported, flag, inProgress };
  };
}

const chrome = browser('Chrome');
const safari = browser('Safari');
const edge = browser('Edge');
const firefox = browser('Firefox');

var styles = ".title {\n  text-align: center;\n  font-size: 300%;\n  margin: 1em 0;\n}\n\n.features {\n  list-style-type: none;\n  padding: 0;\n  max-width: 900px;\n  margin: auto;\n}\n\nmodule-feature {\n  display: block;\n  margin-top: 1em;\n}\n\n[slot=label] {\n  background-color: var(--banner);\n  margin: 0;\n  padding: 0.3em 0.5em;\n}\n\n[slot=desc] {\n  padding: 0 0.5em;\n  color: var(--light);\n  font-size: 110%;\n  line-height: 1.5em;\n}\n\n[slot=desc] a,\n[slot=desc] a:visited {\n  color: var(--light);\n  font-weight: bold;\n}\n\n.note {\n  padding: 0.5em;\n  line-height: 1.5em;\n}\n\n.note:nth-child(even) {\n  background: #FA824C;\n  color: var(--dark);\n}\n\n.note:nth-child(even) a,\n.note:nth-child(even) a:visited {\n  color: var(--dark);\n  font-weight: bold;\n}\n\n.note:nth-child(odd) {\n  background: var(--dark);\n  color: var(--light);\n}\n\n.note:nth-child(odd) a,\n.note:nth-child(odd) a:visited {\n  color: var(--light);\n  font-weight: bold;\n}\n\n.closing {\n  margin: 1.5em 0;\n  text-align: center;\n  font-size: 200%;\n  font-weight: bold;\n  font-style: italic;\n}";

var styles$1 = ".arm,\n.feature,\n.results {\n  display: flex;\n}\n\n.arm {\n  background: var(--secondary);\n}\n\n.feature {\n  flex-direction: column;\n  flex: 2;\n}\n\n.results {\n  flex-direction: column;\n  flex: 2;\n}\n\n.browsers {\n  align-self: flex-end;\n  list-style-type: none;\n  padding: 0;\n  margin: 0;\n}\n\n.browser {\n  display: inline-block;\n  padding: 0.7em;\n  margin: 0.3em;\n}\n\n.browser img {\n  width: 5em;\n}\n\n.browser.supported {\n  background: #376D37;\n}\n\n.browser.in-progress {\n  background: #D5BB00;\n}\n\n.browser:not(.supported):not(.in-progress) {\n  background: #F24236;\n}";

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

    if (!feature) {
      return fritz.h('div', null);
    }

    return fritz.h(
      'article',
      null,
      fritz.h(
        'style',
        null,
        styles$1
      ),
      fritz.h(
        'div',
        { 'class': 'arm' },
        fritz.h(
          'header',
          { 'class': 'feature' },
          fritz.h('slot', { name: 'label' }),
          fritz.h('slot', { name: 'desc' })
        ),
        fritz.h(
          'div',
          { 'class': 'results' },
          fritz.h(
            'ul',
            { 'class': 'browsers' },
            ["Chrome", "Firefox", "Safari", "Edge"].map(name => {
              let browser = find(feature, b => b.name === name);
              let classes = ["browser", browser.supported ? "supported" : browser.inProgress ? "in-progress" : ""];
              return fritz.h(
                'li',
                { 'class': classes.join(' ') },
                fritz.h('img', { src: `./img/${name.toLowerCase()}.png`, title: name })
              );
            })
          ),
          fritz.h('slot', { name: 'notes' })
        )
      )
    );
  }
}

fritz.define('module-feature', ModuleFeature);

class AreModulesReady extends Component {
  constructor() {
    super();
    this.script = [chrome(true, true), firefox(true, true), edge(true, true), safari(true)];
    this.workers = [chrome(false), firefox(false), edge(false), safari(false)];
    this.dynamic = [chrome(false, false, true), firefox(false), edge(false), safari(true, true)];
  }

  render() {
    const { script, workers, dynamic } = this;

    return fritz.h(
      'main',
      null,
      fritz.h(
        'style',
        null,
        styles
      ),
      fritz.h(
        'h1',
        { 'class': 'title' },
        'Are Modules Ready?'
      ),
      fritz.h(
        'article',
        { 'class': 'features' },
        fritz.h(
          'module-feature',
          { feature: script },
          fritz.h(
            'h2',
            { slot: 'label' },
            '<script type="module">'
          ),
          fritz.h(
            'p',
            { slot: 'desc' },
            'The ability to load a module and its dependencies from a <script> tag.'
          ),
          fritz.h(
            'section',
            { slot: 'notes' },
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Chrome'
              ),
              ': Available in Chrome 61.'
            ),
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Firefox'
              ),
              ': Available in Firefox 54 behind a flag. In about:config search for ',
              fritz.h(
                'em',
                null,
                'dom.moduleScripts.enabled'
              ),
              ' and set to true.'
            ),
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Safari'
              ),
              ': Available in Safari 10.1.'
            ),
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Edge'
              ),
              ': Available via the Windows Insider Program.'
            )
          )
        ),
        fritz.h(
          'module-feature',
          { feature: workers },
          fritz.h(
            'h2',
            { slot: 'label' },
            'Worker modules'
          ),
          fritz.h(
            'p',
            { slot: 'desc' },
            'Create Web Workers that are modules (and are able to import other modules) using ',
            fritz.h(
              'code',
              null,
              'new Worker(path,  type: "module") '
            )
          ),
          fritz.h(
            'section',
            { slot: 'notes' },
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Chrome'
              ),
              ': ',
              fritz.h(
                'a',
                { href: 'https://bugs.chromium.org/p/chromium/issues/detail?id=680046' },
                'Not yet in progress'
              ),
              '.'
            ),
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Firefox'
              ),
              ': ',
              fritz.h(
                'a',
                { href: 'https://bugzilla.mozilla.org/show_bug.cgi?id=1247687' },
                'Not yet in progress'
              ),
              '.'
            ),
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Safari'
              ),
              ': Not yet implemented.'
            ),
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Edge'
              ),
              ': Not yet implemented.'
            )
          )
        ),
        fritz.h(
          'module-feature',
          { feature: dynamic },
          fritz.h(
            'h2',
            { slot: 'label' },
            'import()'
          ),
          fritz.h(
            'p',
            { slot: 'desc' },
            'Provides the ability to dynamically import a module from within a module or a script. ',
            fritz.h(
              'a',
              { href: 'https://tc39.github.io/proposal-dynamic-import/' },
              'Spec'
            ),
            '.'
          ),
          fritz.h(
            'section',
            { slot: 'notes' },
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Chrome'
              ),
              ': ',
              fritz.h(
                'a',
                { href: 'https://bugs.chromium.org/p/chromium/issues/detail?id=711706' },
                'In progress'
              ),
              '. ',
              fritz.h(
                'a',
                { href: 'https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/wRLMM5-kpCY/Y0be_ASaAwAJ' },
                'Intent to Implement'
              ),
              '.'
            ),
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Firefox'
              ),
              ': ',
              fritz.h(
                'a',
                { href: 'https://bugzilla.mozilla.org/show_bug.cgi?id=1342012' },
                'Not yet in progress'
              ),
              '.'
            ),
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Safari'
              ),
              ': Available in Safari Technology Preview.'
            ),
            fritz.h(
              'div',
              { 'class': 'note' },
              fritz.h(
                'strong',
                null,
                'Edge'
              ),
              ': Not yet implemented.'
            )
          )
        )
      ),
      fritz.h(
        'div',
        { 'class': 'closing' },
        'We are getting there \uD83E\uDD20!'
      )
    );
  }
}

fritz.define('are-modules-ready', AreModulesReady);

}());
