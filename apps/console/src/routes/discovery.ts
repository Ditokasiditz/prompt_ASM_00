import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getSubdomains } from '../lib/whoisxml.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/discovery/subdomains
 * Body: { domain: string }
 *
 * Calls the WhoisXML Subdomain Lookup API and returns a structured list of
 * all discovered subdomains for the provided root domain.
 *
 * Response:
 * {
 *   domain: string,
 *   total: number,
 *   subdomains: { domain: string }[]
 * }
 */
router.post('/subdomains', async (req: Request, res: Response) => {
  const { domain } = req.body as { domain?: string };

  if (!domain || typeof domain !== 'string' || domain.trim() === '') {
    res.status(400).json({ error: 'A valid "domain" field is required in the request body.' });
    return;
  }

  // Basic sanitisation — strip protocol/paths if user pasted a full URL
  const sanitised = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')  // strip http(s)://
    .replace(/\/.*$/, '');        // strip any path

  try {
    const result = await getSubdomains(sanitised);

    if (!result) {
      res.status(502).json({
        error: 'Failed to retrieve data from the subdomain lookup service. Check the API key or try again later.',
      });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('[Discovery] Unexpected error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/discovery/save-assets
 * Body: { domain: string, subdomains: string[] }
 *
 * Clears ALL existing assets for the root domain (hostname === rootDomain OR
 * hostname ends with ".rootDomain"), then inserts the freshly discovered records.
 *
 * This guarantees the Assets table always reflects the most recent scan result
 * and never accumulates stale / removed subdomains from previous runs.
 *
 * Response:
 * {
 *   saved: number,      // total inserted (root domain + subdomains)
 *   domain: string
 * }
 */
router.post('/save-assets', async (req: Request, res: Response) => {
  const { domain, subdomains } = req.body as {
    domain?: string;
    subdomains?: string[];
  };

  if (!domain || typeof domain !== 'string' || domain.trim() === '') {
    res.status(400).json({ error: 'A valid "domain" field is required.' });
    return;
  }

  if (!Array.isArray(subdomains) || subdomains.length === 0) {
    res.status(400).json({ error: '"subdomains" must be a non-empty array of strings.' });
    return;
  }

  const rootDomain = domain.trim().toLowerCase();

  try {
    // ── STEP 1: Clear all existing assets for this domain ──────────────────
    // Delete every record whose hostname IS the root domain OR ends with
    // ".{rootDomain}" (i.e. all previously saved subdomains for this target).
    const deleted = await prisma.asset.deleteMany({
      where: {
        OR: [
          { hostname: rootDomain },
          { hostname: { endsWith: `.${rootDomain}` } },
        ],
      },
    });
    console.log(`[Discovery] Cleared ${deleted.count} existing assets for root domain: ${rootDomain}`);

    let saved = 0;

    // ── STEP 2: Insert the root domain itself as type "domain" ──────────────
    await prisma.asset.create({
      data: { hostname: rootDomain, type: 'domain', isExposed: false },
    });
    saved++;

    // ── STEP 3: Insert every subdomain — chunked to avoid pool exhaustion ───
    const CHUNK_SIZE = 50;
    for (let i = 0; i < subdomains.length; i += CHUNK_SIZE) {
      const chunk = subdomains.slice(i, i + CHUNK_SIZE);

      await prisma.asset.createMany({
        data: chunk.map((hostname: string) => ({
          hostname: hostname.trim().toLowerCase(),
          type: 'subdomain',
          isExposed: false,
        })),
        skipDuplicates: true,
      });

      saved += chunk.length;
    }

    console.log(`[Discovery] Saved ${saved} assets for root domain: ${rootDomain}`);
    res.json({ saved, domain: rootDomain });
  } catch (error) {
    console.error('[Discovery] Error saving assets:', error);
    res.status(500).json({ error: 'Internal server error while saving assets to database.' });
  }
});

export default router;
