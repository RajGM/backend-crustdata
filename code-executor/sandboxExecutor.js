const vm = require('vm');

// 1. Assume a generated function and parameters
const generatedFunctionCode = `
  function generatedFunction(a, b) {
    return a + b;
  }
`;
const params = [5, 3];

// 2. Create a sandbox context
const sandbox = { console };
vm.createContext(sandbox);

try {
  // 3. Inject and compile the function in the sandbox
  vm.runInContext(generatedFunctionCode, sandbox, { timeout: 1000 });

  // 4. Construct the invocation code with parameters
  const invocationCode = `generatedFunction(${params.map(p => JSON.stringify(p)).join(', ')})`;

  // 5. Execute the function
  const result = vm.runInContext(invocationCode, sandbox, { timeout: 1000 });

  // 6. Process and output the result
  console.log('Function executed successfully. Result:', result);
} catch (error) {
  console.error('An error occurred:', error);
}
