const { spawn } = require('child_process');
const path = require('path');

// Wrapper to execute SQL via SQL*Plus CLI for maximum compatibility
async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const sqlplus = spawn('sqlplus', ['-S', '/nolog'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let output = '';
    let error = '';

    sqlplus.stdout.on('data', (data) => {
      output += data.toString();
    });

    sqlplus.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Build connection command
    const connStr = `${process.env.DB_USER || 'system'}/@${process.env.DB_NAME || 'xe'}`;
    const password = process.env.DB_PASSWORD || '';

    //Send commands to SQL*Plus
    sqlplus.stdin.write(`SET HEADING OFF FEEDBACK OFF PAGESIZE 0 LINESIZE 1000\n`);
    sqlplus.stdin.write(`WHENEVER SQLERROR EXIT SQL.SQLCODE\n`);
    sqlplus.stdin.write(`CONNECT ${connStr}\n`);
    if (password) {
      sqlplus.stdin.write(`${password}\n`);
    }
    sqlplus.stdin.write(`${sql}\n`);
    sqlplus.stdin.write(`EXIT\n`);
    sqlplus.stdin.end();

    sqlplus.on('close', (code) => {
      if (code === 0 || code === null) {
        resolve(output.trim());
      } else {
        reject(new Error(`SQL*Plus error: ${error || output}`));
      }
    });

    sqlplus.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { executeSql };
