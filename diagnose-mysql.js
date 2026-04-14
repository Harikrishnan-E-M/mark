const mysql = require('./server/node_modules/mysql2/promise');

async function testConnections() {
  console.log('MySQL Connection Diagnostic Tool');
  console.log('='.repeat(50));
  console.log('\nTesting various connection combinations...\n');

  const tests = [
    { host: 'localhost', user: 'root', password: '' },
    { host: '127.0.0.1', user: 'root', password: '' },
    { host: 'localhost', user: 'root', password: 'root' },
    { host: 'localhost', user: 'root', password: '24csr094' },
    { host: 'localhost', user: 'system', password: '24csr094' },
    { host: 'localhost', user: 'admin', password: '' },
    { host: 'localhost', user: 'mysql', password: '' },
  ];

  for (const test of tests) {
    try {
      const conn = await mysql.createConnection({
        host: test.host,
        port: 3306,
        user: test.user,
        password: test.password,
        connectTimeout: 3000,
      });
      console.log(`✓ SUCCESS: user='${test.user}', password='${test.password || '(empty)'}', host='${test.host}'`);
      await conn.end();
    } catch (err) {
      console.log(`✗ Failed: user='${test.user}', password='${test.password || '(empty)'}' - ${err.code}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('If none worked, please check MySQL Workbench connection settings and provide the correct credentials.');
}

testConnections().catch(console.error);
