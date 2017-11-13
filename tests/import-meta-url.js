let url = import.meta.url;

let itWorked = /import-meta-url/.test(url);
let el = document.querySelector('#import-meta-url');
if(itWorked) {
  el.classList.add('works');
}
