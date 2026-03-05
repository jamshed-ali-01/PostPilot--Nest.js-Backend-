import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding subscription plans...');

    const plans = [
        {
            name: 'Bronze',
            price: 20,
            description: 'The essentials to get your local business online.',
            features: [
                'Templated posting',
                'Autoscheduling',
                'Geo targeted hashtags',
                'Review and testimonials'
            ],
            isPopular: false
        },
        {
            name: 'Silver',
            price: 40,
            description: 'Scale your reach with localized ad distribution.',
            features: [
                'Templated posting',
                'Autoscheduling',
                'Geo targeted hashtags',
                'Review and testimonials',
                'Geo targeted Ad postings (leaflet distribution)'
            ],
            isPopular: true
        },
        {
            name: 'Gold',
            price: 50,
            description: 'Enhance your brand with custom media and direct client engagement.',
            features: [
                'Templated posting',
                'Autoscheduling',
                'Geo targeted hashtags',
                'Review and testimonials',
                'Geo targeted Ad postings (leaflet distribution)',
                'Upload pictures and videos',
                'Client review link'
            ],
            isPopular: false
        },
        {
            name: 'Platinum',
            price: 97,
            description: 'The ultimate fully-managed AI acceleration package.',
            features: [
                'Templated posting',
                'Autoscheduling',
                'Geo targeted hashtags',
                'Review and testimonials',
                'Geo targeted Ad postings (leaflet distribution)',
                'Upload pictures and videos',
                'Client review link',
                'Smart AI suggestion',
                'Employee accounts',
                'Personalisation'
            ],
            isPopular: false
        }
    ];

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { name: plan.name },
            update: {
                price: plan.price,
                description: plan.description,
                features: plan.features,
                isPopular: plan.isPopular
            },
            create: plan
        });
        console.log(`Upserted plan: ${plan.name}`);
    }

    console.log('Seeding finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
