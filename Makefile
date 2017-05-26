.PHONY: app main minify polys dev watch serve

app:
	./node_modules/.bin/rollup -c rollup.config.js -o app.js src/app.js

main:
	./node_modules/.bin/rollup -c rollup.config.js -o main.js src/main.js

polys:
	cp ./node_modules/@webcomponents/custom-elements/custom-elements.min.js ce.js
	cp ./node_modules/cloudydom/cloudydom.min.js sd.js

minify:
	babili app.js > app.min.js
	mv app.min.js app.js
	babili main.js > main.min.js
	mv main.min.js main.js

serve:
	http-server -p 8077

watch:
	find src -name "*.*" | entr make app

dev:
	make watch & make serve

release: app main polys minify