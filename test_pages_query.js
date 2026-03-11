async function test() {
  const query = `
    query {
      facebookPages(businessId: "699f4ae941f0a67bb7b65054") {
        id
        name
      }
    }
  `;

  try {
    const res = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    console.log("GraphQL Result:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

test();
