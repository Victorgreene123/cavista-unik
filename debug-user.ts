
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = 'c4998075-44d9-4a08-930d-98f80b34ec78';
  
  console.log('Checking User:', userId);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      individualProfile: true,
      doctorProfile: true,
      hospitalProfile: true
    }
  });

  console.log(JSON.stringify(user, null, 2));

  // Also check if any individual profile has this user
  const profile = await prisma.individualProfile.findFirst({
        where: { userId: userId }
  });
   console.log('Direct profile lookup:', JSON.stringify(profile, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
