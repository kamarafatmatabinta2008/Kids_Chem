import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data with Prisma...')

  const topicsData = [
    {
      title: 'Oxygen & Combustion',
      slug: 'oxygen-combustion',
      subject: 'CHEMISTRY' as const,
      tier: 'PRIMARY' as const,
      textbookSource: 'Aki-Ola Integrated Science Series',
      rawTextbookExcerpt: 'Combustion is a chemical process in which a substance reacts rapidly with oxygen and gives off heat. The original substance is called the fuel, and the source of oxygen is called the oxidizer.',
      simplified150Story: 'A candle needs oxygen to burn. If you put a glass over a lit candle, the flame will slowly go out because it uses up the oxygen.',
      labMatrixConfig: {
        assets: ['candle', 'beaker', 'leaf'],
        rules: [
          { when: 'beaker_on_candle', effect: 'reduce_oxygen', amount: 50 },
          { when: 'leaf_in_beaker', effect: 'increase_oxygen', amount: 30 }
        ]
      },
      sortOrder: 1,
      quiz: {
        create: {
          passingScore: 80,
          questions: {
            create: [
              {
                questionText: 'What does a candle need to keep burning?',
                options: ['Nitrogen', 'Oxygen', 'Carbon Dioxide', 'Water'],
                correctOption: 'Oxygen',
                explanationsFromTextbook: 'A candle needs oxygen from the air to maintain combustion.'
              },
              {
                questionText: 'What happens when you put a glass over a lit candle?',
                options: ['It burns brighter', 'The glass melts', 'The flame goes out', 'Nothing changes'],
                correctOption: 'The flame goes out',
                explanationsFromTextbook: 'The glass traps a limited amount of air; once the oxygen is gone, the candle stops burning.'
              }
            ]
          }
        }
      }
    },
    {
      title: 'States of Matter',
      slug: 'states-of-matter',
      subject: 'PHYSICS' as const,
      tier: 'PRIMARY' as const,
      textbookSource: 'Aki-Ola Integrated Science Series',
      rawTextbookExcerpt: 'Matter exists in three main states: solid, liquid, and gas. Solids have a definite shape and volume. Liquids have a definite volume but take the shape of their container.',
      simplified150Story: 'Matter can be a solid, liquid, or gas. Heating or cooling can change matter from one state to another. Think about ice melting into water when warmed.',
      labMatrixConfig: { assets: ['ice', 'heat-source'], rules: [] },
      sortOrder: 2,
      quiz: {
        create: {
          passingScore: 80,
          questions: {
            create: [
              {
                questionText: 'Which state of matter has a fixed shape?',
                options: ['Gas', 'Liquid', 'Solid', 'Plasma'],
                correctOption: 'Solid',
                explanationsFromTextbook: 'In a solid, particles are packed tightly, giving it a stable shape.'
              }
            ]
          }
        }
      }
    }
  ]

  for (const topic of topicsData) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {},
      create: topic
    })
    console.log(`Seeded topic: ${topic.title}`)
  }

  const testUserId = '00000000-0000-0000-0000-000000000001'
  
  await prisma.profile.upsert({
    where: { id: testUserId },
    update: {},
    create: {
      id: testUserId,
      phoneNumber: '+232000000001',
      passwordHash: '$2a$12$LJ3m4ys3Lg3YOCwI2kYOYO1mDkVx7YqGHgfOXQqCZa3gNVKLlIF2e',
      fullName: 'Test Parent',
      role: 'parent',
      students: {
        create: {
          fullName: 'Junior Scientist',
          tier: 'PRIMARY',
          continuousStreakDays: 5,
          targetedWeakness: 'CHEMISTRY'
        }
      }
    }
  })

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
