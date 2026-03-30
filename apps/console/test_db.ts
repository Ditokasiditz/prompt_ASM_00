import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const issuesForAssets = await prisma.issueOnAsset.findMany({
    where: {
      issue: {
        title: {
          in: ['Anonymous FTP Enabled', 'Directory Listing Enabled']
        }
      }
    },
    include: {
      issue: true,
      asset: true,
    },
  });

  console.log("Found NEW scanner records in IssueOnAsset:", issuesForAssets.length);
  for(const record of issuesForAssets) {
     console.log(`Asset: ${record.asset.hostname} | Issue: ${record.issue.title} | Status: ${record.status}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
