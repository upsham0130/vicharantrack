import pdfplumber,re,json,openpyxl
from pathlib import Path
base=Path(r'C:\Users\upsha\Downloads\Telegram Desktop')
pdf=[]
with pdfplumber.open(base/'MSM Vichran Detail.pdf') as p:
 for i,page in enumerate(p.pages,1):
  for line in (page.extract_text() or '').splitlines():
   m=re.match(r'^([૦-૯0-9]{2}/[૦-૯0-9]{2}/[૦-૯0-9]{4})\s+([૦-૯0-9]{2}/[૦-૯0-9]{2}/[૦-૯0-9]{4})\s+(.+?)\s+[૦-૯0-9]+\s+[૦-૯0-9]+(?:\s+[૦-૯0-9]+)?$',line)
   if m: pdf.append(dict(page=i,start=m[1],end=m[2],place=m[3]))
places=sorted(set(r['place'] for r in pdf))
names='Johannesburg|New Jersey|Mwanza|Vyara|Houston|New Delhi|New Delhi|Philadelphia|Zadeshwar|Jamnagar|Jalandhar|Jinja|Atladara (Vadodara)|Abu Dhabi|Ahmedabad|Anand|Abu|Nairobi|East London|Ukai|Adelaide|Atlanta|Edison|Auckland|Catskill|Kampala|Kolkata|Gondal|Gadhada|Gandhinagar|Gold Coast|Godhra|Chansad|Chennai|Junagadh|Junagadh|Jakarta|Jaipur|Jodhpur|Johannesburg|Toronto|Toronto|Dabhan|Dabhoi|Dallas|Dangara|Tithal|Dubai|Dar es Salaam|Dar es Salaam|Dharampur|Dhari|Dhulia|Dhulia|Dholka|Nadiad|Navsari|Nagpur|Nashik|Nenpur|Nairobi|Pindwara|Perth|Paliyad|Pune|Paris|Bengaluru|Bangkok|Budapest|Bochasan|Bodeli|Bharuch|Bhuj|Bhadra|Bhavnagar|Bhuj|Mahuva|Masai Mara|Mahelav|Mehsana|Mumbai|Melbourne|Melbourne|Morbi|Rajkot|Robbinsville|Robbinsville|Limbdi|London|London (Stansted)|Limuru|Leicester|Lenasia|Los Angeles|Vadodara|Wellington|Washington DC|Ahmedabad|Sankari|South London|San Jose|Sarangpur|Sydney|Surendranagar|Surat|Silvassa|Hong Kong|Brisbane|Vidyanagar|Chicago|Singapore|Secunderabad|Sydney|Himmatnagar|Himmatnagar'.split('|')
assert len(places)==len(names),(len(places),len(names))
for r in pdf:r['english']=dict(zip(places,names))[r['place']]
w=openpyxl.load_workbook(base/'PSM Vicharan_1950_2015 (Original v2).xlsx',read_only=True,data_only=True)
psm=[dict(row=i,place=r[0],day=int(r[7]),month=int(r[8]),year=int(r[9])) for i,r in enumerate(w.active.values,1) if i>=5]
Path('data/historical-source.json').write_text(json.dumps(dict(psm=psm,msm=pdf),ensure_ascii=False),encoding='utf-8')
print('Extracted',len(psm),'workbook rows,',len(pdf),'PDF ranges;',len(places),'PDF locations')

