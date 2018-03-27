.PHONY: polys dev serve sw

polys:
	cp ./node_modules/@webcomponents/custom-elements/custom-elements.min.js js/ce.js
	cp ./node_modules/cloudydom/cloudydom.min.js js/sd.js

sw:
	node scripts/sw.js

serve:
	http-server -p 8077

dev: serve

release: polys sw

deploy:
	aws s3 sync . s3://aremodulesready.com --exclude ".git/*" --exclude "node_modules/*"
.PHONY: deploy
