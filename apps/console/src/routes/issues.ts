import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
    try {
        const issues = await prisma.issue.findMany({
            include: {
                asset: {
                    select: {
                        hostname: true,
                        ipAddress: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Ensure impact is returned
        const mappedIssues = issues.map(issue => ({
            ...issue,
            impact: issue.impact ?? (issue.severity === 'High' ? 5.6 : issue.severity === 'Medium' ? 3.1 : 1.0)
        }));

        res.json(mappedIssues);
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
