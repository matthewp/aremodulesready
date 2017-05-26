class Feature {
  constructor(name) {
    this.name = name;
  }

  infer(res) {
    this.supported = res[0].toUpperCase() === 'Y';
    this.flag = this.supported && /flag/.test(res);
    return this;
  }
}

class Browser {
  constructor(name) {
    this.name = name;
  }

  someSupport() {
    return this.scriptTypeModule.supported ||
      this.worker.supported ||
      this.dynamicImport.supported;
  }
}

export function cull(values) {
  return values[0].slice(1).map((name, idx) => {
    idx++;

    let browser = new Browser(name);
    browser.scriptTypeModule = new Feature().infer(values[1][idx]);
    browser.worker = new Feature().infer(values[2][idx]);
    browser.dynamicImport = new Feature().infer(values[3][idx]);
    
    return browser;
  })
  .reduce((feats, browser) => {
    feats[0][browser.name] = browser.scriptTypeModule;
    feats[1][browser.name] = browser.worker;
    feats[2][browser.name] = browser.dynamicImport;
    return feats;
  }, [
    new Feature("script type=module"),
    new Feature("Worker modules"),
    new Feature("import()")
  ]);
}