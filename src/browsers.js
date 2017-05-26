function browser(name) {
  return function(supported, flag){
    return { name, supported, flag };
  }
}

export const chrome = browser('Chrome');
export const safari = browser('Safari');
export const edge = browser('Edge');
export const firefox = browser('Firefox');