import puppeteer from 'puppeteer-core';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'http://localhost:5173';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(__dirname, '../screenshots');
const PDF_OUT = path.join(__dirname, '../plazacomer-screens.pdf');

const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2 };

const CART_STATE = JSON.stringify([
	{
		productoId: 'p18',
		tiendaId: 't1',
		cantidad: 1,
		precio: 35000,
		lineId: 'li-demo-1',
		selecciones: { m6: 'op17', m7: 'op21', m8: 'op24', m9: ['op28'] },
		notas: 'Sin cilantro por favor'
	},
	{
		productoId: 'p1',
		tiendaId: 't1',
		cantidad: 2,
		precio: 28000,
		lineId: 'li-demo-2',
		selecciones: { m1: 'op1', m2: ['op4'] },
		notas: ''
	}
]);

const PANTALLAS = [
	// ── Auth ────────────────────────────────────────────────────────────────
	{ id: '00-login', ruta: '/login', titulo: 'Login' },

	// ── Feed ────────────────────────────────────────────────────────────────
	{ id: '01-inicio', ruta: '/app/inicio', titulo: 'Inicio — Feed principal' },
	{
		id: '02-inicio-food',
		ruta: '/app/inicio',
		titulo: 'Inicio — Filtro Comida',
		postLoad: async (page) => {
			await page.evaluate(() => {
				const btn = [...document.querySelectorAll('button')].find((b) =>
					b.textContent.trim().startsWith('🍔')
				);
				btn?.click();
			});
			await delay(450);
		}
	},

	// ── Explorar ────────────────────────────────────────────────────────────
	{ id: '03-explorar', ruta: '/app/explorar', titulo: 'Explorar — Todas las tiendas' },
	{
		id: '04-explorar-filtros',
		ruta: '/app/explorar',
		titulo: 'Explorar — Panel de filtros avanzados',
		postLoad: async (page) => {
			await page.evaluate(() => {
				const btn = [...document.querySelectorAll('button')].find(
					(b) =>
						b.querySelector('svg') && b.children.length <= 2 && !b.textContent.includes('Todas')
				);
				btn?.click();
			});
			await delay(450);
		}
	},

	// ── Tienda ──────────────────────────────────────────────────────────────
	{
		id: '05-tienda-catalogo',
		ruta: '/app/tienda/t1',
		titulo: 'Tienda — El Sabor Casero · Catálogo'
	},
	{
		id: '06-tienda-ofertas',
		ruta: '/app/tienda/t1',
		titulo: 'Tienda — El Sabor Casero · Ofertas',
		postLoad: async (page) => {
			await page.evaluate(() => {
				const btn = [...document.querySelectorAll('button')].find((b) =>
					b.textContent.includes('Ofertas')
				);
				btn?.click();
			});
			await delay(350);
		}
	},
	{
		id: '07-tienda-resenas',
		ruta: '/app/tienda/t8',
		titulo: 'Tienda — Pizza Pazza · Reseñas',
		postLoad: async (page) => {
			await page.evaluate(() => {
				const btn = [...document.querySelectorAll('button')].find((b) =>
					b.textContent.includes('Reseñas')
				);
				btn?.click();
			});
			await delay(350);
		}
	},
	{
		id: '08-tienda-info',
		ruta: '/app/tienda/t1',
		titulo: 'Tienda — Info',
		postLoad: async (page) => {
			await page.evaluate(() => {
				const btn = [...document.querySelectorAll('button')].find(
					(b) => b.textContent.trim() === 'Info'
				);
				btn?.click();
			});
			await delay(350);
		}
	},

	// ── Modal personalización ──────────────────────────────────────────────
	{
		id: '09-customize',
		ruta: '/app/tienda/t1',
		titulo: 'Modal — Personalizar producto',
		postLoad: async (page) => {
			// Click el primer botón + del catálogo
			await page.evaluate(() => {
				const addBtns = [
					...document.querySelectorAll('button[style*="background:var(--c-brand)"]')
				];
				if (addBtns[0]) addBtns[0].click();
			});
			await delay(600);
		}
	},

	// ── Carrito ─────────────────────────────────────────────────────────────
	{ id: '10-carrito', ruta: '/app/carrito', titulo: 'Carrito de compras', injectCart: true },

	// ── Checkout ────────────────────────────────────────────────────────────
	{ id: '11-checkout', ruta: '/app/checkout', titulo: 'Checkout — Formulario', injectCart: true },
	{
		id: '12-checkout-pago',
		ruta: '/app/checkout',
		titulo: 'Checkout — Selección de método de pago',
		injectCart: true,
		postLoad: async (page) => {
			await page.evaluate(() => {
				const btn = [...document.querySelectorAll('button')].find((b) =>
					b.textContent.trim().startsWith('Pagar $')
				);
				btn?.click();
			});
			await delay(600);
		}
	},

	// ── Pedidos ─────────────────────────────────────────────────────────────
	{ id: '13-pedidos', ruta: '/app/pedidos', titulo: 'Mis Pedidos — Lista' },
	{
		id: '14-pedido-shipping',
		ruta: '/app/pedidos/pm1',
		titulo: 'Pedido — En camino (timeline en vivo)'
	},
	{
		id: '15-pedido-delivered',
		ruta: '/app/pedidos/pm2',
		titulo: 'Pedido — Entregado (buzón de sugerencias)'
	},
	{
		id: '16-pedido-buzon',
		ruta: '/app/pedidos/pm2',
		titulo: 'Pedido — Modal buzón de sugerencias',
		postLoad: async (page) => {
			await page.evaluate(() => {
				const btn = [...document.querySelectorAll('button')].find((b) =>
					b.textContent.includes('Escribir sugerencia')
				);
				btn?.click();
			});
			await delay(500);
		}
	},
	{
		id: '17-pedido-cancelar',
		ruta: '/app/pedidos/pm3',
		titulo: 'Pedido — Modal cancelación',
		postLoad: async (page) => {
			await page.evaluate(() => {
				const btn = [...document.querySelectorAll('button')].find((b) =>
					b.textContent.includes('Cancelar pedido')
				);
				btn?.click();
			});
			await delay(450);
		}
	},

	// ── Mensajes ────────────────────────────────────────────────────────────
	{ id: '18-mensajes', ruta: '/app/mensajes', titulo: 'Mensajes — Conversaciones' },
	{ id: '19-chat', ruta: '/app/mensajes/t1', titulo: 'Mensajes — Chat con tienda' },

	// ── Perfil ──────────────────────────────────────────────────────────────
	{ id: '20-perfil', ruta: '/app/perfil', titulo: 'Perfil — Cuenta' },
	{
		id: '21-perfil-dark',
		ruta: '/app/perfil',
		titulo: 'Perfil — Modo oscuro',
		preLoad: async (page) => {
			await page.evaluateOnNewDocument(() => localStorage.setItem('pc_dark', '1'));
		}
	}
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function setupPage(browser, pantalla) {
	const page = await browser.newPage();
	await page.setViewport(VIEWPORT);

	// Limpiar estado por defecto
	await page.evaluateOnNewDocument(() => {
		localStorage.setItem('pc_cart', '[]');
		localStorage.setItem('pc_dark', '0');
	});

	if (pantalla.injectCart) {
		await page.evaluateOnNewDocument((data) => localStorage.setItem('pc_cart', data), CART_STATE);
	}
	if (pantalla.preLoad) await pantalla.preLoad(page);

	return page;
}

async function run() {
	fs.mkdirSync(OUT_DIR, { recursive: true });

	console.log('Lanzando Chrome headless...\n');
	const browser = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=2']
	});

	const captured = [];

	for (const pantalla of PANTALLAS) {
		process.stdout.write(
			`  [${String(captured.length + 1).padStart(2, '0')}] ${pantalla.titulo}...`
		);
		let page;
		try {
			page = await setupPage(browser, pantalla);
			await page.goto(`${BASE}${pantalla.ruta}`, { waitUntil: 'networkidle0', timeout: 18000 });
			await delay(900);
			if (pantalla.postLoad) await pantalla.postLoad(page);

			const outPath = path.join(OUT_DIR, `${pantalla.id}.png`);
			await page.screenshot({ path: outPath, fullPage: false });
			captured.push({ path: outPath, titulo: pantalla.titulo });
			console.log(' ✓');
		} catch (err) {
			console.log(` ✗ (${err.message.slice(0, 60)})`);
		} finally {
			if (page) await page.close();
		}
	}

	await browser.close();

	// ── Generar PDF ──────────────────────────────────────────────────────────
	console.log(`\nCompilando PDF (${captured.length} pantallas)...`);
	const pdfDoc = await PDFDocument.create();
	pdfDoc.setTitle('PlazaComer — Pantallas del MVP');
	pdfDoc.setAuthor('PlazaComer');
	pdfDoc.setCreationDate(new Date());

	const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

	// Portada
	const coverPage = pdfDoc.addPage([595, 842]);
	coverPage.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.97, 0.35, 0.05) });
	coverPage.drawRectangle({ x: 0, y: 0, width: 595, height: 280, color: rgb(0.61, 0.17, 0.04) });
	coverPage.drawText('PlazaComer', {
		x: 56,
		y: 642,
		font: fontBold,
		size: 56,
		color: rgb(1, 1, 1)
	});
	coverPage.drawText('Capturas de pantalla del MVP', {
		x: 56,
		y: 590,
		font: fontReg,
		size: 20,
		color: rgb(1, 0.88, 0.78)
	});
	coverPage.drawText(`${captured.length} pantallas  ·  Mayo 2026`, {
		x: 56,
		y: 558,
		font: fontReg,
		size: 13,
		color: rgb(1, 0.78, 0.62)
	});
	coverPage.drawText('Stack: SvelteKit · Svelte 5 · TypeScript · TailwindCSS v4', {
		x: 56,
		y: 130,
		font: fontReg,
		size: 11,
		color: rgb(1, 0.72, 0.54)
	});
	coverPage.drawText('Plataforma de comercio hiperlocal para plazas de mercado colombianas', {
		x: 56,
		y: 110,
		font: fontReg,
		size: 10,
		color: rgb(1, 0.65, 0.48)
	});

	// Índice
	const indexPage = pdfDoc.addPage([595, 842]);
	indexPage.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.98, 0.98, 0.98) });
	indexPage.drawRectangle({ x: 0, y: 800, width: 595, height: 42, color: rgb(0.97, 0.35, 0.05) });
	indexPage.drawText('Índice de pantallas', {
		x: 40,
		y: 814,
		font: fontBold,
		size: 14,
		color: rgb(1, 1, 1)
	});

	let yIdx = 762;
	for (let i = 0; i < captured.length; i++) {
		const num = String(i + 1).padStart(2, '0');
		indexPage.drawText(`${num}.  ${captured[i].titulo}`, {
			x: 50,
			y: yIdx,
			font: fontReg,
			size: 11,
			color: i % 2 === 0 ? rgb(0.15, 0.15, 0.15) : rgb(0.35, 0.35, 0.35)
		});
		yIdx -= 22;
		if (yIdx < 50) break;
	}

	// Pantallas
	for (let i = 0; i < captured.length; i++) {
		const { path: imgPath, titulo } = captured[i];
		if (!fs.existsSync(imgPath)) continue;

		const imgBytes = fs.readFileSync(imgPath);
		const img = await pdfDoc.embedPng(imgBytes);
		const natural = img.scale(1);

		const PAGE_W = 595;
		const PAGE_H = 842;
		const MX = 40;
		const HEADER_H = 52;
		const FOOTER_H = 28;
		const availW = PAGE_W - MX * 2;
		const availH = PAGE_H - HEADER_H - FOOTER_H - 16;

		const scale = Math.min(availW / natural.width, availH / natural.height);
		const drawW = natural.width * scale;
		const drawH = natural.height * scale;
		const drawX = MX + (availW - drawW) / 2;
		const drawY = FOOTER_H + 8 + (availH - drawH) / 2;

		const p = pdfDoc.addPage([PAGE_W, PAGE_H]);

		// Fondo
		p.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: rgb(0.95, 0.95, 0.95) });
		// Header
		p.drawRectangle({
			x: 0,
			y: PAGE_H - HEADER_H,
			width: PAGE_W,
			height: HEADER_H,
			color: rgb(0.97, 0.35, 0.05)
		});
		p.drawText('PlazaComer', {
			x: MX,
			y: PAGE_H - 18,
			font: fontBold,
			size: 10,
			color: rgb(1, 1, 1)
		});
		p.drawText(titulo, { x: MX, y: PAGE_H - 36, font: fontReg, size: 13, color: rgb(1, 1, 1) });
		// Sombra
		p.drawRectangle({
			x: drawX + 3,
			y: drawY - 3,
			width: drawW,
			height: drawH,
			color: rgb(0.78, 0.78, 0.78)
		});
		// Imagen
		p.drawImage(img, { x: drawX, y: drawY, width: drawW, height: drawH });
		// Footer
		p.drawText(`${i + 1} / ${captured.length}`, {
			x: PAGE_W - MX - 40,
			y: 10,
			font: fontReg,
			size: 9,
			color: rgb(0.55, 0.55, 0.55)
		});
	}

	const pdfBytes = await pdfDoc.save();
	fs.writeFileSync(PDF_OUT, pdfBytes);

	const mb = (pdfBytes.length / 1024 / 1024).toFixed(1);
	console.log(`\n✓ PDF generado: ${PDF_OUT}`);
	console.log(`  ${captured.length + 2} páginas (portada + índice + pantallas)  ·  ${mb} MB\n`);
}

run().catch((err) => {
	console.error('\nError fatal:', err);
	process.exit(1);
});
