dependencies:
	npm install

test: dependencies
	npm test

run: dependencies
	npm start

image:
	docker build . -f Dockerfile --tag template-nodejs-express:local

