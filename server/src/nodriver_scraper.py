import sys
import nodriver as uc

url = sys.argv[1]
async def main():
    browser = await uc.start()
    page = await browser.get(url)

    await page.save_screenshot()
    await page.get_content()
    await page.scroll_down(150)
    elems = await page.select_all('*[src]')

    for elem in elems:
        await elem.flash()

if __name__ == '__main__':
    uc.loop().run_until_complete(main())
