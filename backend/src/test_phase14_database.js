import { DatabaseRegistry } from './engine/database/DatabaseRegistry.js';
import { MongoProvider } from './engine/database/MongoProvider.js';
import { MySQLProvider } from './engine/database/MySQLProvider.js';
import { PostgresProvider } from './engine/database/PostgresProvider.js';
import { DatabaseValidator } from './engine/database/DatabaseValidator.js';
import { DatabaseExecutor } from './engine/database/DatabaseExecutor.js';

async function runTests() {
  console.log('=== Running Phase 14 Universal Database Framework Test Suite ===\n');
  let passed = 0;
  let total = 0;

  function assert(testName, actual, expected) {
    total++;
    const match = JSON.stringify(actual) === JSON.stringify(expected);
    if (match) {
      passed++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error(`   Expected:`, expected);
      console.error(`   Actual:  `, actual);
    }
  }

  // 1. Registry Test
  const providers = DatabaseRegistry.list();
  assert('Registry lists providers', providers.length >= 3, true);
  assert('MongoDB registered', providers.some((p) => p.id === 'mongodb'), true);
  assert('MySQL registered', providers.some((p) => p.id === 'mysql'), true);
  assert('PostgreSQL registered', providers.some((p) => p.id === 'postgres'), true);

  // 2. MongoDB Provider Test
  const mongo = new MongoProvider({ database: 'automatex_test' });
  await mongo.connect();
  const mongoHealth = await mongo.healthCheck();
  assert('MongoDB Health Status', mongoHealth.status, 'Connected');

  const mongoInsert = await mongo.insert('users', { name: 'Divyansh', email: 'divyansh@example.com' });
  assert('MongoDB Insert returns insertedId', Boolean(mongoInsert.insertedId), true);

  const mongoFind = await mongo.find('users', { name: 'Divyansh' });
  assert('MongoDB Find returns documents', mongoFind.documents.length > 0, true);
  await mongo.disconnect();

  // 3. MySQL Provider Test
  const mysql = new MySQLProvider({ database: 'automatex_mysql' });
  await mysql.connect();
  const mysqlHealth = await mysql.healthCheck();
  assert('MySQL Health Status', mysqlHealth.status, 'Connected');

  const mysqlInsert = await mysql.insert('users', { name: 'Divyansh', email: 'divyansh@example.com' });
  assert('MySQL Insert generates SQL with placeholders', mysqlInsert.sql.includes('VALUES (?, ?)'), true);

  const mysqlSelect = await mysql.find('users', { id: 1 });
  assert('MySQL Select generates WHERE clause with placeholders', mysqlSelect.sql.includes('WHERE id = ?'), true);
  await mysql.disconnect();

  // 4. PostgreSQL Provider Test
  const postgres = new PostgresProvider({ database: 'automatex_pg' });
  await postgres.connect();
  const pgHealth = await postgres.healthCheck();
  assert('PostgreSQL Health Status', pgHealth.status, 'Connected');

  const pgInsert = await postgres.insert('users', { name: 'Divyansh', email: 'divyansh@example.com' });
  assert('Postgres Insert uses $1, $2 placeholders', pgInsert.sql.includes('$1, $2'), true);

  const pgSelect = await postgres.find('users', { id: 1 });
  assert('Postgres Select uses $1 placeholder', pgSelect.sql.includes('WHERE "id" = $1'), true);
  await postgres.disconnect();

  // 5. Database Validator Test
  const validCheck = DatabaseValidator.validate('mysql', { table: 'users', query: 'SELECT * FROM users WHERE id = ?' });
  assert('Validator approves safe parameterized SQL', validCheck.isValid, true);

  const sqlInjCheck = DatabaseValidator.validate('mysql', { table: 'users', query: "SELECT * FROM users WHERE email = '${userInput}'" });
  assert('Validator flags dangerous string concatenation', sqlInjCheck.isValid, false);

  // 6. Database Executor Test
  const execResult = await DatabaseExecutor.execute(
    {
      type: 'mongodb',
      data: {
        config: {
          operation: 'find',
          collection: 'users',
          query: { name: 'Divyansh' },
        },
      },
    },
    { ownerId: 'test_user_1' }
  );
  assert('DatabaseExecutor executes successfully', execResult.status, 'SUCCESS');
  assert('DatabaseExecutor exposes documents array', Array.isArray(execResult.outputs.documents), true);

  console.log(`\n=== Test Results: ${passed}/${total} Passed ===`);
  if (passed === total) {
    console.log('🎉 ALL UNIVERSAL DATABASE FRAMEWORK TESTS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
