import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findUnique({
    where: { email: 'harsh@org.local' },
    include: {
      policies: {
        include: {
          policy: true
        }
      },
      memberships: {
        include: {
          group: {
            include: {
              policies: {
                include: {
                  policy: true
                }
              }
            }
          }
        }
      }
    }
  });
  console.log('USER:', JSON.stringify(user, null, 2));
}

run();
