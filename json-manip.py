# import json and read json file
import json
import base64
from PIL import Image, ImageDraw, ImageFont
import io
import sys

arg = False
# get the input filename from command line arguments
if len(sys.argv) > 1:
    arg = True
    input_filename = sys.argv[1]
else:
    video_name = 'bejeweled-taylor-swift'
    input_filename = f'exported-jsons/{video_name}.json'

# read json file
with open(input_filename) as f:
    data = json.load(f)

image_list = []
caption_list = []

for d in data:
    img = data[d]['image'].split(',')[1]
    img = base64.b64decode(img)
    img = Image.open(io.BytesIO(img))
    image_list.append(img)
    caption = data[d]['timestamp'] + ' - ' + data[d]['caption']
    caption_list.append(caption)

new_image_list = []
for i in range(len(image_list)):
    img = image_list[i]
    caption = caption_list[i]
    width, height = img.size

    # create a new image with extra space for the caption
    new_height = height + 100  # Adjust the height as needed
    new_img = Image.new('RGB', (width, new_height), (255, 255, 255))
    new_img.paste(img, (0, 0))

    draw = ImageDraw.Draw(new_img)
    font_path = "/Library/Fonts/Arial.ttf"  # specify the full path to the font file
    font = ImageFont.truetype(font_path, 42)  # increase the font size significantly

    # wrap the caption text
    max_width = width - 20  # adjust the max width as needed
    lines = []
    words = caption.split()
    while words:
        line = ''
        while words and draw.textbbox((0, 0), line + words[0], font=font)[2] <= max_width:
            line += (words.pop(0) + ' ')
        lines.append(line)

    # draw each line of the caption
    y_text = height + 10  # starting y position for the text
    for line in lines:
        text_bbox = draw.textbbox((0, 0), line, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_x = (width - text_width) // 2
        draw.text((text_x, y_text), line, fill=(0, 0, 0), font=font)
        y_text += text_bbox[3] - text_bbox[1]

    # save the new image
    new_image_list.append(new_img)

# stitch the new image list with only 2 images per row
max_width = max(img.width for img in new_image_list)
max_height = max(img.height for img in new_image_list)
rows = (len(new_image_list) + 1) // 2
combined_width = max_width * 2
combined_height = max_height * rows

combined_img = Image.new('RGB', (combined_width, combined_height), (255, 255, 255))

x_offset = 0
y_offset = 0
for i, img in enumerate(new_image_list):
    combined_img.paste(img, (x_offset, y_offset))
    if (i + 1) % 2 == 0:
        x_offset = 0
        y_offset += max_height
    else:
        x_offset += max_width

# Save the stitched image
if arg:
    video_name = input_filename.split('/')[-1].split('.')[0]
    combined_img.save(f'{video_name}.png')
else:
    combined_img.save(f'output-imgs/{video_name}.png')
