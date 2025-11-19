/**
 * Script para probar el scraping localmente SIN Chromium Lambda
 * Usa Puppeteer estándar para desarrollo local
 */

const puppeteer = require('puppeteer');

const URL = 'https://ultimosismo.igp.gob.pe/ultimo-sismo/sismos-reportados';

async function testScraping() {
  let browser = null;

  try {
    console.log('Iniciando prueba de scraping local...');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(60000);

    console.log(`Navegando a: ${URL}`);
    await page.goto(URL, {
      waitUntil: 'networkidle0'
    });

    console.log('Esperando que la tabla se cargue...');
    await page.waitForSelector('table tbody tr', { timeout: 30000 });

    // Extraer datos de la tabla
    const sismos = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));

      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 5) return null;

        return {
          reporte_sismico: cells[0]?.textContent?.trim() || '',
          referencia: cells[1]?.textContent?.trim() || '',
          fecha_hora_local: cells[2]?.textContent?.trim() || '',
          magnitud: cells[3]?.textContent?.trim() || '',
          enlace_reporte: cells[4]?.querySelector('a')?.href || ''
        };
      }).filter(item => item !== null);
    });

    console.log(`\n✅ Se encontraron ${sismos.length} sismos\n`);
    console.log('Primeros 3 registros:');
    console.log(JSON.stringify(sismos.slice(0, 3), null, 2));

    return sismos;

  } catch (error) {
    console.error('❌ Error durante el scraping:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('\nBrowser cerrado');
    }
  }
}

// Ejecutar test
testScraping()
  .then(() => {
    console.log('\n✅ Test completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test fallido:', error);
    process.exit(1);
  });