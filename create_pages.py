import os
import re

with open("products.html", "r") as f:
    content = f.read()

# Pages to create
pages = {
    "carpets-rugs.html": {
        "title": "Carpets & Rugs",
        "categories": ["carpets"]
    },
    "cushions-throws.html": {
        "title": "Cushions & Throws",
        "categories": ["cushions", "throws"]
    },
    "poufs-ottomans.html": {
        "title": "Poufs & Ottomans",
        "categories": ["poufs"]
    },
    "accessories.html": {
        "title": "Accessories",
        "categories": ["accessories"]
    }
}

nav_replacement = """      <div class="nav-links">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <div class="dropdown">
          <a href="javascript:void(0)" class="dropdown-toggle active">Products <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></a>
          <div class="dropdown-content">
            <a href="carpets-rugs.html">Carpets & Rugs</a>
            <a href="cushions-throws.html">Cushions & Throws</a>
            <a href="poufs-ottomans.html">Poufs & Ottomans</a>
            <a href="accessories.html">Accessories</a>
          </div>
        </div>
        <a href="certifications.html">Certifications</a>
        <a href="clients.html">Clients</a>
        <a href="contact.html">Contact</a>
      </div>"""

mobile_nav_replacement = """    <div class="mobile-nav-links">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="carpets-rugs.html">Carpets & Rugs</a>
      <a href="cushions-throws.html">Cushions & Throws</a>
      <a href="poufs-ottomans.html">Poufs & Ottomans</a>
      <a href="accessories.html">Accessories</a>
      <a href="certifications.html">Certifications</a>
      <a href="clients.html">Clients</a>
      <a href="contact.html">Contact</a>
    </div>"""

# Remove filter bar
content = re.sub(r'<!-- Filter Bar -->.*?</div>\s*<!-- Product Grid -->', '<!-- Product Grid -->', content, flags=re.DOTALL)

for page_file, info in pages.items():
    page_content = content
    
    # Update title
    page_content = re.sub(r'<title>.*?</title>', f'<title>{info["title"]} | Rugs Creation</title>', page_content)
    page_content = re.sub(r'<h1>.*?</h1>', f'<h1>{info["title"]}</h1>', page_content)
    page_content = re.sub(r'<span class="breadcrumb">Home > Our Products</span>', f'<span class="breadcrumb">Home > Products > {info["title"]}</span>', page_content)
    
    # Replace nav links
    page_content = re.sub(r'<div class="nav-links">.*?</div>', nav_replacement, page_content, count=1, flags=re.DOTALL)
    page_content = re.sub(r'<div class="mobile-nav-links">.*?</div>', mobile_nav_replacement, page_content, count=1, flags=re.DOTALL)
    
    # Filter products
    cards_html = ""
    cards = re.findall(r'<div class="product-card".*?</div>\s*</div>\s*(?:<!--|<div class="product-card"|</div>\s*</section>)', page_content, re.DOTALL)
    
    # A safer way to filter cards:
    # Let's just find all cards and keep the ones that match categories.
    cards = re.finditer(r'<div class="product-card" data-category="([^"]+)">.*?<a href="#" class="btn btn-ghost">Enquire Now</a>\s*</div>', content, re.DOTALL)
    
    filtered_cards = []
    for card in cards:
        if card.group(1) in info["categories"]:
            filtered_cards.append(card.group(0))
            
    cards_html = "\n        ".join(filtered_cards)
    
    # Replace the product grid content
    page_content = re.sub(r'<div class="product-grid reveal">.*?</div>\s*</div>\s*</section>', f'<div class="product-grid reveal">\n        {cards_html}\n      </div>\n    </div>\n  </section>', page_content, flags=re.DOTALL)

    with open(page_file, "w") as f:
        f.write(page_content)
        
print("Pages created successfully.")
