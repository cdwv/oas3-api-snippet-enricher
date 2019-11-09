'use strict';

const fs = require('fs');
const SwaggerSnippet = require('swagger-snippet');
const targets = ['node_request','shell_curl', 'shell_httpie', 'python_python3', 'php_curl', 'php_http1', 'php_http2'];

if(process.argv.length < 3){
	throw new Error("Please pass the OpenAPI JSON schema as argument.");
}

fs.readFile(process.argv[2], (err, data) => {
    if (err) throw err;
    let schema = JSON.parse(data);

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
    console.log(JSON.stringify(schema));
});

