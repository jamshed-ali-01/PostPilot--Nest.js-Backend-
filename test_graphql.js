const http = require('http');

async function testGraphQL() {
    const query = `
    mutation {
      login(input: { email: "jamshedlinkedin@gmail.com", password: "a" }) {
        access_token
        user {
          id
          email
          isSystemAdmin
          firstName
          name
        }
      }
    }
  `;

    const data = JSON.stringify({ query });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/graphql',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
        },
    };

    const req = http.request(options, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            console.log('[GraphQL Response]', JSON.stringify(JSON.parse(rawData), null, 2));
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(data);
    req.end();
}

testGraphQL();
