import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const fakeArray = Array.from({ length: 5 }).map((_, index) => index);
  console.log("Seeding the database!");

  for await (const iterator of fakeArray) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        image: faker.image.avatar(),
      },
    });

    const articleFakeArray = Array.from({
      length: faker.number.int({ max: 5, min: 3 }),
    }).map((_, index) => index);

    for await (const iterator of articleFakeArray) {
      await prisma.article.create({
        data: {
          title: faker.lorem.words(8),
          description: faker.lorem.lines(4),
          html: faker.lorem.paragraphs(5),
          markdown: faker.lorem.paragraphs(5),
          slug: faker.lorem.slug(),
          author: {
            connect: {
              id: user.id,
            },
          },
          featured_image: faker.image.urlPicsumPhotos(),
          tags: {
            connectOrCreate: {
              create: {
                name: faker.lorem.words() + faker.lorem.word(),
                description: faker.lorem.paragraphs(1),
                slug: faker.lorem.slug(),
              },
              where: {
                id: faker.string.uuid(),
              },
            },
          },
        },
      });
    }
  }
  console.log("Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
