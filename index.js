'use strict';

const fs = require('fs');
const SwaggerSnippet = require('swagger-snippet');
const yaml = require('js-yaml');

const targets = ['node_request','shell_curl', 'shell_httpie', 'python_python3', 'php_curl', 'php_http1', 'php_http2'];

function enrichSchema(schema){
	for(var path in schema.paths){
			
		for(var method in schema.paths[path]){
			var generatedCode = SwaggerSnippet.getEndpointSnippets(schema, path, method, targets);
			schema.paths[path][method]["x-code-samples"] = [];
			for(var snippetIdx in generatedCode.snippets){
				var snippet = generatedCode.snippets[snippetIdx];
				schema.paths[path][method]["x-code-samples"][snippetIdx] = { "lang": snippet.title, "source": snippet.content };
			}
			
		}
	}
	return schema;
}

if(process.argv.length < 3){
	throw new Error("Please pass the OpenAPI JSON schema as argument.");
}

// Try to interpret as YAML first, based on file extension

if(process.argv[2].indexOf('yml') !== -1 || process.argv[2].indexOf('yaml') !== -1){
	try {
		
		let schema = yaml.safeLoad(fs.readFileSync(process.argv[2], 'utf8'));
		schema = enrichSchema(schema);
		console.log(JSON.stringify(schema));
	} catch (e) {
		// Do something with this
		console.log(e);
		
	}
	
} else {
	
	fs.readFile(process.argv[2], (err, data) => {
		if (err) throw err;
		let schema = JSON.parse(data);
		schema = enrichSchema(schema);
		console.log(JSON.stringify(schema));
	});
	
}


