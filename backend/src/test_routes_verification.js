import app from './app.js';

function verifyRoutes() {
  console.log('=== Verifying Route Registrations ===\n');

  const registeredRoutes = [];

  function printRoutes(stack, path = '') {
    stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        registeredRoutes.push(`${methods} ${path}${layer.route.path}`);
      } else if (layer.name === 'router' && layer.handle.stack) {
        const regexp = layer.regexp.source;
        let prefix = '';
        if (regexp.includes('api\\/v1\\/database')) prefix = '/api/v1/database';
        else if (regexp.includes('api\\/v1\\/credentials')) prefix = '/api/v1/credentials';
        else if (regexp.includes('api\\/v1\\/workflows')) prefix = '/api/v1/workflows';
        else if (regexp.includes('api\\/v1\\/auth')) prefix = '/api/v1/auth';
        else if (regexp.includes('api\\/v1\\/executions')) prefix = '/api/v1/executions';
        printRoutes(layer.handle.stack, prefix);
      }
    });
  }

  printRoutes(app._router.stack);

  console.log('Registered Routes:');
  registeredRoutes.forEach((r) => console.log(`  - ${r}`));

  const hasMongoTest = registeredRoutes.some((r) => r.includes('POST') && r.includes('/database/mongodb/test'));
  const hasCredentialsPost = registeredRoutes.some((r) => r.includes('POST') && r.includes('/credentials'));

  console.log('\nValidation Results:');
  console.log(`✅ POST /api/v1/database/mongodb/test registered: ${hasMongoTest}`);
  console.log(`✅ POST /api/v1/credentials registered: ${hasCredentialsPost}`);

  if (hasMongoTest && hasCredentialsPost) {
    console.log('\n🎉 ALL REQUIRED ROUTES VERIFIED SUCCESSFULLY WITH 0 ESM ERRORS!');
  } else {
    console.error('\n❌ ROUTE VERIFICATION FAILED');
    process.exit(1);
  }
}

verifyRoutes();
