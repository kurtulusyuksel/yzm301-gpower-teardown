"""Render the actual asciicast transcript into a 60-second MP4 (not a desktop capture)."""
import json
import subprocess
import textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

folder = Path('demo/frames')
folder.mkdir(parents=True, exist_ok=True)
events = [json.loads(line) for line in Path('demo/cli.cast').read_text(encoding='utf-8').splitlines()[1:]]
font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 21)
small = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 17)
for second in range(60):
    screen = Image.new('RGB', (1440, 900), '#101722')
    draw = ImageDraw.Draw(screen)
    draw.text((32, 20), 'PairedLab | YZM301 | Actual CLI transcript replay', font=font, fill='#69dfc2')
    draw.text((32, 57), 'Recorded subprocess output; rendered terminal video, not a desktop screen capture.', font=small, fill='#aeb8c7')
    content = ''.join(e[2] for e in events if e[0] <= second+.999).replace('\r', '')
    lines = [part for line in content.splitlines() for part in (textwrap.wrap(line, width=105) or [''])]
    for index, line in enumerate(lines[-26:]):
        draw.text((32, 110+index*27), line, font=font, fill='#edf2f7')
    draw.text((32, 850), f'{second+1:02d} / 60 seconds | Synthetic data only', font=small, fill='#aeb8c7')
    screen.save(folder/f'{second:03d}.png')
subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','1','-i',str(folder/'%03d.png'),
    '-c:v','libx264','-pix_fmt','yuv420p','-r','30','-t','60','-movflags','+faststart','demo/cli-demo.mp4'],check=True)
print('Rendered demo/cli-demo.mp4 (60 seconds).')
