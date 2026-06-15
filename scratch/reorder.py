import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Split on section markers: <!-- ===== ... ===== -->
pattern = r'(<!-- =+\n\s+([^\n]+?)\n\s+=+ -->)'
parts = re.split(pattern, text)

# parts[0] = everything before first marker
# then triples: marker, name, content
before = parts[0]
triples = []
i = 1
while i < len(parts):
    marker = parts[i]
    name = parts[i+1].strip()
    content = parts[i+2]
    triples.append((name, marker + content))
    i += 3

order = [
    'NAVIGATION',
    'HERO (Atmospheric)',
    'STATS BAR',
    'WHO IS THIS FOR',
    'BENTO GRID SECTION (MASTERMIND SKILLS)',
    'THE PILLARS',
    'THE JOURNEY',
    'PROGRAMS',
    'TEAM',
    'QUIZ',
    'FOR BUSINESS',
    'FAQ',
    'FOOTER',
]

by_name = {name: block for name, block in triples}
missing = [n for n in order if n not in by_name]
if missing:
    raise ValueError(f'Missing sections: {missing}')

extra = [name for name, _ in triples if name not in order]
if extra:
    print('WARNING: these markers are not in the order list and will be dropped:', extra)

ordered_blocks = [before]
for name in order:
    ordered_blocks.append(by_name[name])

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(''.join(ordered_blocks))

print('Reordered sections:', order)
