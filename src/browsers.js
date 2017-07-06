function browser(name) {
  return function(supported, flag, inProgress){
    return { name, supported, flag, inProgress };
  }
}

export const chrome = browser('Chrome');
export const safari = browser('Safari');
export const edge = browser('Edge');
export const firefox = browser('Firefox');