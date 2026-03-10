const token = 'REPLACE_WITH_USER_TOKEN'; // I need the user's token from terminal or logs

async function test() {
  try {
    const res = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: 'query { facebookAdAccounts(businessId: "699f4ae941f0a67bb7b65054") { id name } }'
      })
    });
    console.log(JSON.stringify(await res.json(), null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
