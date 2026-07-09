import { PrismaClient, PolicyType } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log('Starting database seeding...');

    // 1. Hash Passwords using bcrypt
    const saltRounds = 10;
    const rootPasswordHash = await bcrypt.hash('root1234', saltRounds);
    const alicePasswordHash = await bcrypt.hash('alice1234', saltRounds);
    const bobPasswordHash = await bcrypt.hash('bob1234', saltRounds);
    const charliePasswordHash = await bcrypt.hash('charlie1234', saltRounds);

    // 2. Seed Users (idempotently using upsert)
    console.log('Seeding users...');
    const root = await prisma.user.upsert({
        where: { email: 'root@org.local' },
        update: {
            name: 'Root',
            passwordHash: rootPasswordHash,
            isRoot: true
        },
        create: {
            email: 'root@org.local',
            name: 'Root',
            passwordHash: rootPasswordHash,
            isRoot: true,
        },
    });

    const alice = await prisma.user.upsert({
        where: { email: 'alice@org.local' },
        update: {
            name: 'Alice',
            passwordHash: alicePasswordHash,
            isRoot: false
        },
        create: {
            email: 'alice@org.local',
            name: 'Alice',
            passwordHash: alicePasswordHash,
            isRoot: false,
        }
    });

    const bob = await prisma.user.upsert({
        where: { email: 'bob@org.local' },
        update: {
            name: 'Bob',
            passwordHash: bobPasswordHash,
            isRoot: false
        },
        create: {
            email: 'bob@org.local',
            name: 'Bob',
            passwordHash: bobPasswordHash,
            isRoot: false,
        },
    });

    const charlie = await prisma.user.upsert({
        where: { email: 'charlie@org.local' },
        update: {
            name: 'Charlie',
            passwordHash: charliePasswordHash,
            isRoot: false
        },
        create: {
            email: 'charlie@org.local',
            name: 'Charlie',
            passwordHash: charliePasswordHash,
            isRoot: false,
        },
    });

    // 3. Seed MANAGED Policies (JSON Format)
    console.log('Seeding Policies...');
    const readOnlyPolicy = await prisma.policy.upsert({
        where: { name: 'ReadOnlyAccess' },
        update: {
            statements: {
                statements: [
                    {
                        Effect: "Allow",
                        Action: [
                            "reports:List",
                            "reports:Read",
                            "alerts:List",
                            "alerts:Read",
                            "audit:List",
                            "audit:Read"
                        ],
                        Resource: ["*"]
                    }
                ]
            }
        },
        create: {
            name: 'ReadOnlyAccess',
            description: 'Allows read-only access to all resources',
            type: PolicyType.MANAGED,
            statements: {
                statements: [
                    {
                        Effect: "Allow",
                        Action: [
                            "reports:List",
                            "reports:Read",
                            "alerts:List",
                            "alerts:Read",
                            "audit:List",
                            "audit:Read"
                        ],
                        Resource: ["*"]
                    },
                ],
            },
        },
    });

    const reportsFullAccessPolicy = await prisma.policy.upsert({
        where: { name: 'ReportsFullAccess' },
        update: {
            statements: {
                statements: [
                    {
                        Effect: "Allow",
                        Action: [
                            "reports:List",
                            "reports:Read",
                            "reports:Create",
                            "reports:Update",
                            "reports:Delete"
                        ],
                        Resource: ["*"]
                    }
                ]
            }
        },
        create: {
            name: 'ReportsFullAccess',
            description: 'Allows full administrative access to Reports',
            type: PolicyType.MANAGED,
            statements: {
                statements: [
                    {
                        Effect: "Allow",
                        Action: [
                            "reports:List",
                            "reports:Read",
                            "reports:Create",
                            "reports:Update",
                            "reports:Delete"
                        ],
                        Resource: ["*"]
                    }
                ]
            },
        },
    });

    //4. Seed Group
    console.log('Seeding groups...');
    const viewersGroup = await prisma.group.upsert({
        where: { name: 'Viewers' },
        update: {},
        create: {
            name: 'Viewers',
            description: 'Group with read-only view access',
        },
    });

    // 5. Attach ReadOnlyAccess to Viewers Group
    console.log('Attaching policies to groups...');
    await prisma.groupPolicyAttachment.upsert({
        where: {
            groupId_policyId: {
                groupId: viewersGroup.id,
                policyId: readOnlyPolicy.id,
            },
        },
        update: {},
        create: {
            groupId: viewersGroup.id,
            policyId: readOnlyPolicy.id,
        },
    });


    //6. Add Alice to Viewers Group
    console.log('adding Alice to Viewers group...');
    await prisma.userGroupMembership.upsert({
        where: {
            userId_groupId: {
                userId: alice.id,
                groupId: viewersGroup.id,
            },
        },
        update: {},
        create: {
            userId: alice.id,
            groupId: viewersGroup.id,
        },
    });

    console.log('Database seeding finished successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Error seeeding database:', e);
        await prisma.$disconnect();
        process.exit(1);
    });