.PHONY: app main minify polys dev watch serve sw

app:
	./node_modules/.bin/rollup -c rollup.config.js -o js/app.js src/app.js

main:
	./node_modules/.bin/rollup -c rollup.config.js -o js/main.js src/main.js

polys:
	cp ./node_modules/@webcomponents/custom-elements/custom-elements.min.js js/ce.js
	cp ./node_modules/cloudydom/cloudydom.min.js js/sd.js

minify:
	babili js/app.js > js/app.min.js
	mv js/app.min.js js/app.js
	babili js/main.js > js/main.min.js
	mv js/main.min.js js/main.js

sw:
	node scripts/sw.js

serve:
	http-server -p 8077

watch:
	find src -name "*.*" | entr make app

dev:
	make watch & make serve

release: app main polys minify sw