import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { getHostInfo } from '../lib/shodan.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
    try {
        const assets = await prisma.asset.findMany({
            include: {
                _count: {
                    select: { issues: true }
                }
            },
            orderBy: {
                discoveredAt: 'desc'
            }
        });
        res.json(assets);
    } catch (error) {
        console.error('Error fetching assets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:id/refresh', async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
        const assetId = id as string;
        const asset = await prisma.asset.findUnique({
            where: { id: parseInt(assetId) }
        });

        if (!asset || !asset.ipAddress) {
            return res.status(404).json({ error: 'Asset not found or has no IP address' });
        }

        const shodanInfo = await getHostInfo(asset.ipAddress);

        if (!shodanInfo) {
            return res.status(404).json({ error: 'Could not find information for this IP in Shodan' });
        }

        const updatedAsset = await prisma.asset.update({
            where: { id: asset.id },
            data: {
                city: shodanInfo.city,
                country: shodanInfo.country_name,
                countryCode: shodanInfo.country_code,
                latitude: shodanInfo.latitude,
                longitude: shodanInfo.longitude,
            }
        });

        res.json(updatedAsset);
    } catch (error) {
        console.error('Error refreshing asset from Shodan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
