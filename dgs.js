const puppeteer = require('puppeteer');


const yeniCikanlar = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 720 })
  await page.goto('', { waitUntil: 'networkidle0' }); // wait until page load
  await page.type('#txtEczaneKodu', '');
  await page.type('#txtKullaniciAdi', '');
  await page.type('#txtSifre', '');
  await page.click('#btnGiris');
  await page.waitForSelector('#ctl00_lblKullaniciAdi_Mimity')
  await page.goto('', { waitUntil: 'networkidle0' }); // wait until page load
  await page.click('#ctl00_ContentPlaceHolder1_chkSadeceStoktakiler', { waitUntil: 'networkidle0' }); // wait until page load)
  await page.waitForSelector('#ctl00_ContentPlaceHolder1_divGrid')

  return page
}


const sayfaSayisi = async (page) => {
  return await page.evaluate(() => {
    const liArr = document.querySelectorAll('ul[class="pagination pull-right Renk1"] > li')
    const link = liArr[liArr.length - 1].querySelector('a[href]').getAttribute('href')
    const arr2 = link.split('=')
    return parseInt(arr2[arr2.length - 1])
  })
}

const urunBilgisiGetir = async (page) => {
  try {
    const urunBilgisi = await page.evaluate(() => {
      let links = [];
      for (let i = 0; i < 10; i++) {
        const element = document.querySelector('table[class="small table table-bordered tbl-cart table-hover"] > tbody').getElementsByTagName("tr")[i]
        if (!element) {
          break
        }
        var link = element.getElementsByTagName("td")[1].querySelector('a[href]').getAttribute('href');
        links.push("" + link)

      }
      return links;

    });

    return urunBilgisi


  } catch (e) {
    console.log(e)
  }
}

const yuru = async () => {
  const page = await yeniCikanlar()
  const toplamSayfa = await sayfaSayisi(page)
  console.log('sayfa sayısı: ', toplamSayfa)
  let allLinks = []
  const pageLinksBir = await urunBilgisiGetir(page)
  allLinks = [...allLinks, ...pageLinksBir]
  for (let i = 1; i <= toplamSayfa - 1; i++) {
    await page.click('[class="glyphicon glyphicon-chevron-right"]')
    await page.waitForSelector('#ctl00_ContentPlaceHolder1_divGrid')
    const pageLinks = await urunBilgisiGetir(page)
    allLinks = [...allLinks, ...pageLinks]
  }

  console.log(allLinks)
  console.log(allLinks.length, ' kayitlik liste geldi...')

  for (let i = 0; i < allLinks.length; i++) {
    const element = allLinks[i];
    await page.goto(element, { waitUntil: 'networkidle0' })
    const urunBilgisi = await page.evaluate(() => {
      return {
        urunKod: _urun.kod,
        urunAd: _urun.ad,
        TavsiyeEdilenSatisFiyati: _urun.tavsiyeEdilenSatisFiyati || 0,
        SonFiyat: _urun.SonFiyat,
        urunBarkod: _urun.barkod,
        firma: _urun.firma,
        FiyatTarihi: _urun.fiyatTar,
        urunTur: _urun.ilacTipi,
        kdv: _urun.kdv
      }
    });
    console.log(urunBilgisi);  

  }
}
yuru()
