import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import { SCANNER_MODULES } from './src/lib/scannerConfig.js';

const execPromise = util.promisify(exec);
const prisma = new PrismaClient();
const PYTHON_MODULES_DIR = path.join(process.cwd(), 'python_modules');

async function testScanner() {
    console.log("[Test] Fetching 2 IPs for test...");
    const assets = await prisma.asset.findMany({
        where: { ipAddress: { not: null } },
        take: 2 // Only test two IPs to avoid hanging
    });

    const results = [];

    for (const asset of assets) {
        if (!asset.ipAddress) continue;

        for (const moduleConfig of SCANNER_MODULES) {
            try {
                console.log(`[Test] Running python ${moduleConfig.moduleName}.py --ip ${asset.ipAddress}`);
                const scriptPath = path.join(PYTHON_MODULES_DIR, `${moduleConfig.moduleName}.py`);
                const { stdout } = await execPromise(`python "${scriptPath}" --ip ${asset.ipAddress}`);
                const data = JSON.parse(stdout.trim()) as { found: boolean };
                
                console.log(`[Test] Python script output parsed: found=${data.found}`);

                const issueRecord = await prisma.issue.upsert({
                    where: { title: moduleConfig.title },
                    update: { severity: moduleConfig.severity, impact: moduleConfig.impact, factor: moduleConfig.factor, description: moduleConfig.description },
                    create: { title: moduleConfig.title, severity: moduleConfig.severity, impact: moduleConfig.impact, factor: moduleConfig.factor, description: moduleConfig.description }
                });

                if (data.found === true) {
                    await prisma.issueOnAsset.upsert({
                        where: { issueId_assetId: { issueId: issueRecord.id, assetId: asset.id } },
                        update: { status: "Open", lastObserved: new Date() },
                        create: { issueId: issueRecord.id, assetId: asset.id, status: "Open" }
                    });
                    results.push({ ip: asset.ipAddress, module: moduleConfig.moduleName, status: "Open" });
                } else {
                    const existingLink = await prisma.issueOnAsset.findUnique({
                         where: { issueId_assetId: { issueId: issueRecord.id, assetId: asset.id } }
                    });
                    if (existingLink && existingLink.status === "Open") {
                         await prisma.issueOnAsset.update({
                              where: { id: existingLink.id },
                              data: { status: "Resolved", lastObserved: new Date() }
                         });
                         results.push({ ip: asset.ipAddress, module: moduleConfig.moduleName, status: "Resolved" });
                    } else {
                       results.push({ ip: asset.ipAddress, module: moduleConfig.moduleName, status: "Not Vulnerable" });
                    }
                }
            } catch (err) {
                console.error(`[Test] Error:`, err);
            }
        }
    }

    console.log("TEST RUN COMPLETE.");
    console.table(results);
}

testScanner().catch(console.error).finally(() => prisma.$disconnect());
