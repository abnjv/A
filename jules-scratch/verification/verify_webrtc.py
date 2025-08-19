import asyncio
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=[
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--no-sandbox'
        ])

        peer1_context = await browser.new_context()
        peer2_context = await browser.new_context()

        page1 = await peer1_context.new_page()
        page2 = await peer2_context.new_page()

        # Capture console messages for debugging
        page1.on("console", lambda msg: print(f"PEER 1 CONSOLE: {msg.text}"))
        page2.on("console", lambda msg: print(f"PEER 2 CONSOLE: {msg.text}"))

        try:
            print("Navigating peers to the test page...")
            await page1.goto("http://localhost:8000/test-voice.html", timeout=10000)
            await page2.goto("http://localhost:8000/test-voice.html", timeout=10000)

            print("Peers clicking 'Join' button...")
            # Click buttons one after the other to avoid race conditions
            await page1.get_by_role("button", name="Join").click()
            await page2.get_by_role("button", name="Join").click()

            # Wait for both peers to get their IDs
            await expect(page1.locator("#my-id-display")).not_to_contain_text("Not connected", timeout=15000)
            peer1_id = await page1.locator("#my-id-display").text_content()
            print(f"Peer 1 joined with ID: {peer1_id}")

            await expect(page2.locator("#my-id-display")).not_to_contain_text("Not connected", timeout=15000)
            peer2_id = await page2.locator("#my-id-display").text_content()
            print(f"Peer 2 joined with ID: {peer2_id}")

            print(f"Peer 1 ({peer1_id}) is calling Peer 2 ({peer2_id})...")
            await page1.get_by_label("Peer's ID to Call:").fill(peer2_id)
            await page1.get_by_role("button", name="Call").click()

            audio_element_selector = f"#audio-container #audio-{peer2_id}"
            print(f"Waiting for audio element '{audio_element_selector}' to be visible on Peer 1's page...")
            await expect(page1.locator(audio_element_selector)).to_be_visible(timeout=20000)

            print("Test successful: Audio element for Peer 2 found on Peer 1's page.")
            screenshot_path = "jules-scratch/verification/verification.png"
            await page1.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"An error occurred during the test: {e}")
            await page1.screenshot(path="jules-scratch/verification/failure_page1.png")
            await page2.screenshot(path="jules-scratch/verification/failure_page2.png")
            print("Saved failure screenshots for debugging.")
            raise
        finally:
            await browser.close()

async def main():
    await run()

if __name__ == "__main__":
    asyncio.run(main())
