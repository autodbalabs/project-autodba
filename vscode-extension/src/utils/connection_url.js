function parseConnectionUrl(dbUrl) {
  const u = new URL(dbUrl);
  const options = {};
  u.searchParams.forEach((value, key) => {
    options[key] = value;
  });
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 5432,
    username: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    dbname: u.pathname.replace(/^\//, ''),
    options
  };
}

function sanitizeConnectionUrl(dbUrl) {
  const u = new URL(dbUrl);
  u.password = '';
  return u.toString();
}

module.exports = { parseConnectionUrl, sanitizeConnectionUrl };
