'use strict';

const fs = require('fs');
const OpenAPISnippet = require('openapi-snippet');
const yaml = require('js-yaml');
const args = require('yargs').argv;

let targets = ['node_request','shell_curl', 'shell_httpie', 'python_python3', 'php_curl', 'php_http1', 'php_http2'];

if (args.targets) {
	targets = args.targets.split(',');
}

function enrichSchema(schema){
	for(var path in schema.paths){
			
		for(var method in schema.paths[path]){
			var generatedCode = OpenAPISnippet.getEndpointSnippets(schema, path, method, targets);
			schema.paths[path][method]["x-code-samples"] = [];
			for(var snippetIdx in generatedCode.snippets){
				var snippet = generatedCode.snippets[snippetIdx];
				schema.paths[path][method]["x-code-samples"][snippetIdx] = { "lang": snippet.title, "source": snippet.content };
			}
			
		}
	}
	return schema;
}

if(!args.input){
	throw new Error("Please pass the OpenAPI JSON schema as argument.");
}

// Try to interpret as YAML first, based on file extension

if(args.input.indexOf('yml') !== -1 || args.input.indexOf('yaml') !== -1){
	try {
		
		let schema = yaml.safeLoad(fs.readFileSync(args.input, 'utf8'));
		schema = enrichSchema(schema);
		console.log(JSON.stringify(schema));
	} catch (e) {
		// Do something with this
		console.log(e);
	}
	
} else {
	
	fs.readFile(args.input, (err, data) => {
		if (err) throw err;
		let schema = JSON.parse(data);
		schema = enrichSchema(schema);
		console.log(JSON.stringify(schema));
	});
	
}


