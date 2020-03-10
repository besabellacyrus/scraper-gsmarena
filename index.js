const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const targetUrl = 'https://www.gsmarena.com/huawei-phones-58.php';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(targetUrl);
    await page.waitForSelector('.makers');
    const makersUl = await page.$('.makers ul');
    const makersAnchors = await makersUl.$$('li a');

    let res = []
    for (let i = 0; i < 1; i++) {
      await page.goto(targetUrl);
      await page.waitForSelector('.makers');
      const makersUl = await page.$('.makers ul');
      const lis = await makersUl.$$('li');
      const makersAnchors = await makersUl.$$('li a');
      let phoneImg = await lis[i].$eval('img', img => img.src)

      const anchor = makersAnchors[i];
      await anchor.click();
      await page.waitForSelector('#specs-list');

      let mainTable = await page.$('#specs-list');
      let phoneName = await page.$eval("h1[data-spec='modelname']", h1 => h1.innerText);
      const tables = await mainTable.$$('table');
      let data = []
      for (const table of tables) {
        const title = await table.$eval('th', th => th.innerText);
        const details = await table.$$('tr');
        let det = []
        for (const detail of details) {
          try {
            det.push({
              title: await detail.$eval('.ttl', td => td.innerText),
              info: await detail.$eval('.nfo', td => td.innerText)
            })
          } catch (error) {
            console.log({ pusherror: error })
          }
        }
        data.push({
          label: title,
          details: det
        })
      }
      res.push({
        phone_id: i,
        phone_name: phoneName,
        phone_image: phoneImg,
        data: data
      })
      console.log(phoneName, 'successfull fetched!')
    }
    fs.writeFile("phones.json", JSON.stringify(res), function (err) {
      console.log('done')
      if (err) {
        console.log(err);
      }
    });
    await browser.close();
  } catch (error) {
    console.log({ error })
  }
})();