import re
from playwright.sync_api import Page, expect, sync_playwright
import sys

def verify_ui_revamp(page: Page):
    """
    This function verifies the UI revamp of the store page.
    """
    print("Navigating to the store page...")
    page.goto("http://localhost:3000")

    # Wait for the page to load and check for console errors
    try:
        page.wait_for_load_state("networkidle")
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg) if msg.type == "error" else None)
        if console_errors:
            print("Console errors found:")
            for error in console_errors:
                print(error.text)
    except Exception as e:
        print(f"An error occurred while checking for console errors: {e}")

    # Change language to English
    print("Changing language to English...")
    page.locator('button:has(svg.lucide-globe)').click()
    page.get_by_role("menuitem", name="English").click()
    page.wait_for_load_state("networkidle")
    print("Language changed to English.")

    # Check if the product grid or the empty state is visible
    product_grid = page.locator("div.grid").first
    empty_state = page.get_by_text("No products found", exact=True)
    try:
        expect(product_grid.or_(empty_state)).to_be_visible(timeout=10000)
        print("Product grid or empty state is visible.")
    except Exception as e:
        print("Could not find product grid or empty state. Printing page content:")
        print(page.content())
        raise e

    # Add a product to the cart
    add_to_cart_button = page.locator('button:has-text("Add to Cart")').first
    if add_to_cart_button.is_visible():
        add_to_cart_button.click()
        print("Added a product to the cart.")
    else:
        print("No 'Add to Cart' button found. Skipping cart interaction.")


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_ui_revamp(page)
            print("UI revamp verification successful!")
            # Take a screenshot of the final state
            page.screenshot(path="jules-scratch/verification/final_state.png")
            print("Screenshot saved to jules-scratch/verification/final_state.png")
        except Exception as e:
            print(f"Verification failed: {e}", file=sys.stderr)
            page.screenshot(path="jules-scratch/verification/failure_state.png")
            print("Failure screenshot saved to jules-scratch/verification/failure_state.png")
            sys.exit(1)
        finally:
            browser.close()
