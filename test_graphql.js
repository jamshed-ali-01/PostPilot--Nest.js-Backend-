async function test() {
  try {
    const res = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'query GetFacebookAdAccounts($businessId: ID){ facebookAdAccounts(businessId: $businessId){ id name } }',
        variables: { businessId: "admin" }
      })
    });
    console.log(
      JSON.stringify(await res.json(), null, 2)
    );
  } catch (err) {
    console.error(err);
  }
}
test();
