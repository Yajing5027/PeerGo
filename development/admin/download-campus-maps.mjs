#!/usr/bin/env node

/**
 * Download map files from MNSU map pages and generate a local manifest.
 * Use only when your team is allowed to cache these files for project use.
 */

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_START_URL = 'https://mankato.mnsu.edu/about-the-university/maps-and-transportation/maps-and-directions/';
const MAX_PAGES_LIMIT = 120;
const DEFAULT_MAX_PAGES = 40;
const ASSET_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'gif']);
const MAP_KEYWORDS = [
    'map',
    'maps',
    'campus',
    'floor',
    'parking',
    'tunnel',
    'building',
    'lot-',
    'lot_',
    'lot ',
    'route',
    'transit',
    'accessibility',
    'aerial',
    'residential',
    'highways'
];
const EXCLUDE_ASSET_KEYWORDS = ['logo', 'icon-facebook', 'icon-instagram', 'icon-linkedin', 'icon-youtube', 'member-logo', 'torch-end'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const mapOutputDir = path.resolve(projectRoot, 'assets', 'maps', 'mnsu');
const manifestPath = path.resolve(projectRoot, 'assets', 'maps', 'manifest.json');

function parseMaxPages(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return DEFAULT_MAX_PAGES;
    }
    return Math.min(Math.floor(parsed), MAX_PAGES_LIMIT);
}

function safeUrl(urlString) {
    try {
        return new URL(urlString);
    } catch (_error) {
        return null;
    }
}

function toAbsoluteUrl(rawLink, baseUrl) {
    if (!rawLink) {
        return '';
    }

    const trimmed = String(rawLink).trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('javascript:')) {
        return '';
    }

    try {
        return new URL(trimmed, baseUrl).href;
    } catch (_error) {
        return '';
    }
}

function decodeEntities(text) {
    return String(text || '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function stripTags(html) {
    return decodeEntities(String(html || '').replace(/<[^>]+>/g, ' '));
}

function getExtensionFromPathname(pathname) {
    const match = String(pathname || '').toLowerCase().match(/\.([a-z0-9]{2,5})$/);
    return match ? match[1] : '';
}

function extensionFromContentType(contentType) {
    const type = String(contentType || '').toLowerCase();
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('png')) return 'png';
    if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
    if (type.includes('svg')) return 'svg';
    if (type.includes('webp')) return 'webp';
    if (type.includes('gif')) return 'gif';
    return '';
}

function isSameHost(urlObj, hostName) {
    return Boolean(urlObj && urlObj.hostname === hostName);
}

function isMapPath(pathname) {
    const lower = String(pathname || '').toLowerCase();
    return lower.includes('/map') || lower.includes('/maps') || lower.includes('parking') || lower.includes('floor-plan') || lower.includes('tunnel');
}

function hasKeyword(text, keywords) {
    const lower = String(text || '').toLowerCase();
    return keywords.some(function(keyword) {
        return lower.includes(keyword);
    });
}

function isLikelyMapAsset(urlObj, hintText) {
    if (!urlObj) {
        return false;
    }

    const ext = getExtensionFromPathname(urlObj.pathname);
    if (!ASSET_EXTENSIONS.has(ext)) {
        return false;
    }

    const fullPath = (String(urlObj.pathname || '') + String(urlObj.search || '')).toLowerCase();
    const fileName = path.basename(String(urlObj.pathname || '')).toLowerCase();
    const hint = String(hintText || '').toLowerCase();

    if (fullPath.includes('/globalassets/maps/')) {
        return true;
    }

    if (fullPath.includes('/map-pdfs/')) {
        return true;
    }

    const excluded = hasKeyword(fileName, EXCLUDE_ASSET_KEYWORDS) || hasKeyword(fullPath, EXCLUDE_ASSET_KEYWORDS);
    const keywordMatched = hasKeyword(fileName, MAP_KEYWORDS) || hasKeyword(hint, MAP_KEYWORDS);

    if (excluded && !keywordMatched) {
        return false;
    }

    return keywordMatched;
}

function isAssetCandidate(urlObj) {
    return isLikelyMapAsset(urlObj, '');
}

function shouldCrawlPage(urlObj, hostName) {
    if (!isSameHost(urlObj, hostName)) {
        return false;
    }

    if (!isMapPath(urlObj.pathname)) {
        return false;
    }

    const ext = getExtensionFromPathname(urlObj.pathname);
    return !ext;
}

function sanitizeFileName(name) {
    const cleaned = String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s_-]/g, ' ')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^[-_]+|[-_]+$/g, '')
        .slice(0, 60);

    return cleaned || 'map';
}

function titleFromUrl(urlObj) {
    const pathName = String(urlObj && urlObj.pathname || '');
    const name = path.basename(pathName).replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
    return name || 'Campus map';
}

function addAssetCandidate(assetMap, assetUrl, rawTitle) {
    if (!assetUrl) {
        return;
    }

    const existed = assetMap.get(assetUrl);
    const title = decodeEntities(rawTitle);

    if (!existed) {
        assetMap.set(assetUrl, {
            title: title
        });
        return;
    }

    if (!existed.title && title) {
        existed.title = title;
    }
}

function extractLinks(html, pageUrl) {
    const links = [];
    const anchorRegex = /<a\b[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
    const srcRegex = /<(?:img|source)\b[^>]*src=(['"])(.*?)\1[^>]*>/gi;

    let match;
    while ((match = anchorRegex.exec(html)) !== null) {
        const href = toAbsoluteUrl(match[2], pageUrl);
        if (!href) continue;

        links.push({
            url: href,
            text: stripTags(match[3]),
            sourceType: 'anchor'
        });
    }

    while ((match = srcRegex.exec(html)) !== null) {
        const src = toAbsoluteUrl(match[2], pageUrl);
        if (!src) continue;

        links.push({
            url: src,
            text: '',
            sourceType: 'media'
        });
    }

    return links;
}

async function crawlForAssets(startUrl, maxPages) {
    const start = safeUrl(startUrl);
    if (!start) {
        throw new Error('Invalid start URL: ' + startUrl);
    }

    const hostName = start.hostname;
    const queue = [start.href];
    const visited = new Set();
    const assetMap = new Map();

    while (queue.length > 0 && visited.size < maxPages) {
        const pageUrl = queue.shift();
        if (visited.has(pageUrl)) {
            continue;
        }

        visited.add(pageUrl);

        try {
            const response = await fetch(pageUrl, { redirect: 'follow' });
            if (!response.ok) {
                continue;
            }

            const finalUrl = response.url || pageUrl;
            const contentType = String(response.headers.get('content-type') || '').toLowerCase();
            const finalUrlObj = safeUrl(finalUrl);

            if (finalUrlObj && isAssetCandidate(finalUrlObj)) {
                addAssetCandidate(assetMap, finalUrl, titleFromUrl(finalUrlObj));
                continue;
            }

            if (!contentType.includes('text/html')) {
                continue;
            }

            const html = await response.text();
            const links = extractLinks(html, finalUrl);

            links.forEach(function(link) {
                const urlObj = safeUrl(link.url);
                if (!urlObj || !isSameHost(urlObj, hostName)) {
                    return;
                }

                if (isLikelyMapAsset(urlObj, link.text)) {
                    addAssetCandidate(assetMap, urlObj.href, link.text || titleFromUrl(urlObj));
                    return;
                }

                if (link.sourceType === 'media') {
                    return;
                }

                if (shouldCrawlPage(urlObj, hostName) && !visited.has(urlObj.href) && queue.indexOf(urlObj.href) === -1) {
                    queue.push(urlObj.href);
                }
            });

            console.log('[crawl]', visited.size + '/' + maxPages, 'assets:', assetMap.size, 'queue:', queue.length, finalUrl);
        } catch (error) {
            console.warn('[skip]', pageUrl, error.message);
        }
    }

    return {
        visitedPages: visited.size,
        assets: assetMap
    };
}

async function downloadAsset(assetUrl, title, index) {
    try {
        const response = await fetch(assetUrl, { redirect: 'follow' });
        if (!response.ok) {
            console.warn('[download skip]', assetUrl, 'status:', response.status);
            return null;
        }

        const finalUrl = response.url || assetUrl;
        const finalUrlObj = safeUrl(finalUrl);
        if (!finalUrlObj) {
            return null;
        }

        const contentType = String(response.headers.get('content-type') || '');
        let ext = getExtensionFromPathname(finalUrlObj.pathname);

        if (!ASSET_EXTENSIONS.has(ext)) {
            ext = extensionFromContentType(contentType);
        }

        if (!ASSET_EXTENSIONS.has(ext)) {
            console.warn('[download skip unsupported]', finalUrl, contentType || '(unknown content type)');
            return null;
        }

        const bytes = Buffer.from(await response.arrayBuffer());
        if (!bytes.length) {
            return null;
        }

        const baseName = sanitizeFileName(title || titleFromUrl(finalUrlObj));
        const digest = createHash('sha1').update(finalUrl).digest('hex').slice(0, 8);
        const prefix = String(index + 1).padStart(3, '0');
        const fileName = prefix + '-' + baseName + '-' + digest + '.' + ext;
        const filePath = path.join(mapOutputDir, fileName);

        await fs.writeFile(filePath, bytes);

        return {
            id: 'mnsu-map-' + (index + 1),
            title: title || titleFromUrl(finalUrlObj),
            localPath: '/assets/maps/mnsu/' + fileName,
            sourceUrl: finalUrl,
            contentType: contentType.split(';')[0] || 'application/octet-stream',
            bytes: bytes.length
        };
    } catch (error) {
        console.warn('[download skip]', assetUrl, error.message);
        return null;
    }
}

async function clearOutputDirectory(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        if (entry.isFile()) {
            await fs.unlink(entryPath);
            continue;
        }

        if (entry.isDirectory()) {
            await fs.rm(entryPath, { recursive: true, force: true });
        }
    }
}

async function main() {
    if (typeof fetch !== 'function') {
        throw new Error('Global fetch is unavailable. Please use Node.js 18+ to run this script.');
    }

    const startUrl = process.argv[2] || DEFAULT_START_URL;
    const maxPages = parseMaxPages(process.argv[3]);

    console.log('Start URL:', startUrl);
    console.log('Max pages:', maxPages);
    console.log('Output dir:', mapOutputDir);

    await fs.mkdir(mapOutputDir, { recursive: true });
    await clearOutputDirectory(mapOutputDir);
    console.log('Output dir cleaned.');

    const crawled = await crawlForAssets(startUrl, maxPages);
    const candidates = Array.from(crawled.assets.entries()).map(function(entry) {
        return {
            url: entry[0],
            title: entry[1].title
        };
    });

    candidates.sort(function(a, b) {
        return a.url.localeCompare(b.url);
    });

    console.log('Candidates found:', candidates.length);

    const downloaded = [];
    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const map = await downloadAsset(candidate.url, candidate.title, downloaded.length);
        if (!map) {
            continue;
        }
        downloaded.push(map);
        console.log('[downloaded]', downloaded.length, map.localPath);
    }

    const manifest = {
        generatedAt: new Date().toISOString(),
        sourcePage: startUrl,
        visitedPages: crawled.visitedPages,
        candidateCount: candidates.length,
        downloadedCount: downloaded.length,
        maps: downloaded
    };

    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

    console.log('Manifest written:', manifestPath);
    console.log('Done. Downloaded maps:', downloaded.length);
}

main().catch(function(error) {
    console.error('Failed:', error.message);
    process.exitCode = 1;
});
