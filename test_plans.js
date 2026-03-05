async function testPlans() {
    try {
        const response = await fetch('http://localhost:3000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
          query GetSubscriptionPlans {
            subscriptionPlans {
              id
              name
              price
              description
              features
              isPopular
            }
          }
        `
            })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testPlans();
