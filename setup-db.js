const mysql = require('./server/node_modules/mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

async function setupDatabase() {
  const schemaPath = path.join(__dirname, 'server', 'sql', 'schema.sql');
  const seedPath = path.join(__dirname, 'server', 'sql', 'seed.sql');
  const advancedPath = path.join(__dirname, 'server', 'sql', 'advanced_objects.sql');

  const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
  const seedSQL = fs.readFileSync(seedPath, 'utf-8');
  const advancedSQL = fs.readFileSync(advancedPath, 'utf-8');

  function splitSqlScript(script) {
    const statements = [];
    const lines = script.split(/\r?\n/);
    let buffer = [];
    let delimiter = ';';

    const pushBuffer = () => {
      const statement = buffer.join('\n').trim();
      buffer = [];
      if (!statement) return;
      statements.push(statement);
    };

    for (const line of lines) {
      const trimmed = line.trim();

      if (/^DELIMITER\s+/i.test(trimmed)) {
        pushBuffer();
        delimiter = trimmed.split(/\s+/)[1];
        continue;
      }

      buffer.push(line);

      if (delimiter !== ';') {
        if (trimmed.endsWith(delimiter)) {
          const statement = buffer.join('\n').trim();
          buffer = [];
          statements.push(statement.slice(0, -delimiter.length).trim() + ';');
        }
        continue;
      }

      if (trimmed.endsWith(';')) {
        pushBuffer();
      }
    }

    pushBuffer();
    return statements;
  }

  async function executeSqlScript(connection, script) {
    const statements = splitSqlScript(script);
    for (const statement of statements) {
      await connection.query(statement);
    }
  }

  const credentials = [];

  if (process.env.DB_USER) {
    credentials.push({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      description: `${process.env.DB_USER} from server/.env`,
    });
  }

  credentials.push(
    { user: 'root', password: '', description: 'root (no password)' },
    { user: 'root', password: '24csr094', description: 'root with 24csr094' },
    { user: 'system', password: '24csr094', description: 'system with 24csr094' },
    { user: 'system', password: '', description: 'system (no password)' }
  );

  // Remove duplicate credential combinations while preserving order.
  const seen = new Set();
  const uniqueCredentials = credentials.filter((cred) => {
    const key = `${cred.user}::${cred.password}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  for (const cred of uniqueCredentials) {
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
      await executeSqlScript(connection, schemaSQL);
      console.log('✓ Schema created successfully');

      console.log('\nRunning seed script...');
      await executeSqlScript(connection, seedSQL);
      console.log('✓ Seed data inserted successfully');

      console.log('\nRunning advanced DBMS objects script...');
      await executeSqlScript(connection, advancedSQL);
      console.log('✓ Advanced objects created successfully');

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
