import sys
import requests
from bs4 import BeautifulSoup

# Check if the script has received an argument
if len(sys.argv) != 2:
    print("Usage: python script.py <url>")
    sys.exit(1)

# Get the URL from the command-line argument
url = sys.argv[1]

# Send a GET request to the URL
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    # Parse the content of the page
    soup = BeautifulSoup(response.content, 'html.parser')

    # Find all image tags
    images = soup.find_all('img')

    # Print out each image URL
    for img in images:
        src = img.get('src')
        if src:  # Only print valid image URLs
            print(f"Image: {src}")
else:
    print(f"Failed to retrieve the webpage. Status code: {response.status_code}")

