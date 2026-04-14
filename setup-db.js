const mysql = require('./server/node_modules/mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const schemaPath = path.join(__dirname, 'server', 'sql', 'schema.sql');
  const seedPath = path.join(__dirname, 'server', 'sql', 'seed.sql');

  const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
  const seedSQL = fs.readFileSync(seedPath, 'utf-8');

  const credentials = [
    { user: 'root', password: '', description: 'root (no password)' },
    { user: 'root', password: '24csr094', description: 'root with 24csr094' },
    { user: 'system', password: '24csr094', description: 'system with 24csr094' },
    { user: 'system', password: '', description: 'system (no password)' },
  ];

  for (const cred of credentials) {
    try {
      console.log(`\nTrying: ${cred.description}...`);
      const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: cred.user,
        password: cred.password,
        multipleStatements: true,
      });

      console.log('✓ Connected!');
      console.log('\nRunning schema script...');
      await connection.query(schemaSQL);
      console.log('✓ Schema created successfully');

      console.log('\nRunning seed script...');
      await connection.query(seedSQL);
      console.log('✓ Seed data inserted successfully');

      await connection.end();
      console.log('\n✓✓✓ Database setup complete!');
      return;
    } catch (error) {
      console.log(`✗ Failed: ${error.message}`);
      continue;
    }
  }

  console.error('\n❌ Could not connect with any credentials.');
  console.log('\nPlease check your MySQL credentials and ensure MySQL is running.');
}

setupDatabase();
