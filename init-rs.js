const { MongoClient } = require('mongodb');

async function main() {
    const url = 'mongodb://127.0.0.1:27017/?directConnection=true';
    const client = new MongoClient(url, {
        serverSelectionTimeoutMS: 5000
    });

    try {
        console.log('Connecting to MongoDB at 127.0.0.1:27017...');
        await client.connect();
        console.log('Connected to MongoDB');

        const admin = client.db('admin');
        console.log('Initiating replica set...');
        const result = await admin.command({
            replSetInitiate: {
                _id: 'rs0',
                members: [{ _id: 0, host: '127.0.0.1:27017' }]
            }
        });

        console.log('Replica set initiated successfully:', result);
    } catch (err) {
        if (err.message.includes('already initialized')) {
            console.log('Replica set is already initialized');
        } else {
            console.error('Error initiating replica set:', err);
        }
    } finally {
        await client.close();
    }
}

main();
