# utils/pdf_generator.py

import os
import requests
from fpdf import FPDF

def generate_pdf(event_name, bills, uploads_folder):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.add_font('Montserrat', '', os.path.join('fonts', 'Montserrat-Medium.ttf'), uni=True)
    pdf.add_font('Montserrat', 'B', os.path.join('fonts', 'Montserrat-Bold.ttf'), uni=True)
    
    pdf.set_font("Montserrat", 'B', 16)
    pdf.cell(0, 10, event_name, ln=True, align='C')
    # Table Headers
    pdf.set_font("Montserrat", 'B', 12)
    line_height = pdf.font_size * 2
    col_widths = [30, 100, 40]  # S.No., Name, Amount
    pdf.ln(10)
    pdf.set_x(20)
    headers = ['S.No.', 'Name', 'Amount']
    for i, header in enumerate(headers):
        pdf.cell(col_widths[i], line_height, header, border=1,align='C')
    pdf.ln(line_height)

    # Table Rows
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Montserrat", '', 12)
    for idx, bill in enumerate(bills, start=1):
        pdf.set_x(20)
        pdf.cell(col_widths[0], line_height, str(idx), border=1, align='C')
        pdf.cell(col_widths[1], line_height, bill['billName'], border=1, align='C')
        pdf.cell(col_widths[2], line_height, str(bill['amount']), border=1, align='C')
        pdf.ln(line_height)
    
    # Adding Images
    pdf.set_x(0)
    c=1
    for bill in bills:
        # Image1
        pdf.add_page()
        pdf.set_font("Montserrat", 'B', 14)
        pdf.cell(0, 10, f"Bill {c}: {bill['billName']}", ln=True)
        pdf.ln(10)
        image1_url = f"http://localhost:5081/getImage/{bill['image1']}"
        image1_path = download_image(image1_url, uploads_folder)
        if image1_path:
            pdf.image(image1_path, w=pdf.w - 40)  # Adjust width as needed

        # Image2
        pdf.add_page()
        pdf.set_font("Montserrat", 'B', 14)
        pdf.cell(0, 10, f"Bill {c}: {bill['billName']}", ln=True)
        pdf.ln(10)
        image2_url = f"http://localhost:5081/getImage/{bill['image2']}"
        image2_path = download_image(image2_url, uploads_folder)
        if image2_path:
            pdf.image(image2_path, w=pdf.w - 40)
        c+=1
        

    return pdf

def download_image(url, uploads_folder):
    try:
        response = requests.get(url)
        response.raise_for_status()
        image_name = url.split('/')[-1]
        image_path = os.path.join(uploads_folder, image_name)
        with open(image_path, 'wb') as f:
            f.write(response.content)
        return image_path
    except requests.exceptions.RequestException as e:
        print(f"Error downloading image {url}: {e}")
        return None
