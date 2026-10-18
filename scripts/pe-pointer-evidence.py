"""Read a bounded data-pointer window, never disassemble or modify the target."""
import argparse
import hashlib
import json
import struct
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('binary', type=Path)
args = parser.parse_args()
data = args.binary.read_bytes()
expected = 'c63e6a133eb6372932f810c08cc33dc35a06d1ddb658f897bd6c34a754efc812'
digest = hashlib.sha256(data).hexdigest()
if digest != expected:
    raise SystemExit('Unexpected binary SHA-256; fixed addresses apply only to the recorded target.')
pe = struct.unpack_from('<I', data, 60)[0]
section_count = struct.unpack_from('<H', data, pe + 6)[0]
optional_size = struct.unpack_from('<H', data, pe + 20)[0]
image_base = struct.unpack_from('<I', data, pe + 24 + 28)[0]
section_start = pe + 24 + optional_size
sections = [struct.unpack_from('<8sIIII', data, section_start + i * 40) for i in range(section_count)]
address = 0x5CAC80
rva = address - image_base
section = next(s for s in sections if s[2] <= rva < s[2] + max(s[1], s[3]))
offset = section[4] + rva - section[2]
report = {
    'method': 'PE section mapping and little-endian uint32 data reads; no instruction decoding',
    'subject_sha256': digest,
    'image_base': hex(image_base),
    'section': section[0].rstrip(b'\0').decode('ascii'),
    'start_address': hex(address),
    'file_offset': hex(offset),
    'byte_length': 256,
    'anchor': 'REA paired descriptor incoming data reference at 0x5cacd8',
    'limitation': 'Adjacency alone does not prove a virtual table boundary or callback semantics.',
    'pointers': [
        {'address': hex(address + i * 4), 'file_offset': hex(offset + i * 4),
         'value': hex(struct.unpack_from('<I', data, offset + i * 4)[0])}
        for i in range(64)
    ]
}
# Retain raw pointer relations used to infer the MSVC RTTI/dispatch candidate.
# The numeric observations remain separate from that structural interpretation.
def file_offset(virtual_address):
    relative = virtual_address - image_base
    item = next(s for s in sections if s[2] <= relative < s[2] + s[3])
    return item[4] + relative - item[2]

def pointer_locations(value):
    needle = struct.pack('<I', value)
    hits = []
    for item in sections:
        start, end = item[4], item[4] + item[3]
        cursor = start
        while True:
            cursor = data.find(needle, cursor, end)
            if cursor < 0:
                break
            if cursor % 4 == 0:
                hits.append(image_base + item[2] + cursor - item[4])
            cursor += 1
    return hits

name_address = 0x60CE90
name_offset = file_offset(name_address)
type_name = data[name_offset:data.index(b'\0', name_offset)].decode('ascii')
chains = []
for reference in pointer_locations(name_address - 8):
    locator = reference - 12
    fields = struct.unpack_from('<5I', data, file_offset(locator))
    if fields[:3] != (0, 0, 0):
        continue
    for pointer in pointer_locations(locator):
        table = pointer + 4
        chains.append({
            'candidate_locator': hex(locator),
            'locator_file_offset': hex(file_offset(locator)),
            'locator_uint32_fields': [hex(value) for value in fields],
            'locator_pointer_address': hex(pointer),
            'candidate_dispatch_table': hex(table),
            'table_first_32_pointers': [
                {'slot_address': hex(table + i * 4),
                 'value': hex(struct.unpack_from('<I', data, file_offset(table + i * 4))[0])}
                for i in range(32)
            ]
        })
report['rtti_candidate'] = {
    'observed_ascii_name': type_name, 'name_address': hex(name_address),
    'type_descriptor_candidate': hex(name_address - 8), 'chains': chains,
    'interpretation': 'Candidate MSVC RTTI locator and dispatch table inferred from name and pointer layout; data relations are observed, dynamic execution is not traced.'
}
Path('evidence/paired-pointer-window.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print('Saved 256-byte data-pointer window with target identity and exact file mapping.')
