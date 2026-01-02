from PIL import Image
import os
import glob

# Source directory (Artifacts)
src_dir = r"C:\Users\cfx33\.gemini\antigravity\brain\7056df70-bc35-45a2-b499-80c61d8a031f"
# Dest directory
dest_dir = r"e:\earthworm\learning-mini\images"

# Map artifact names (partial) to final names
mapping = {
    "tab_home_active": "learn-active_v3.png",
    "tab_home": "learn_v3.png",
    "tab_rank_active": "rank-active_v3.png",
    "tab_rank": "rank_v3.png",
    "tab_profile_active": "profile-active_v3.png",
    "tab_profile": "profile_v3.png"
}

def resize_image(src_path, dest_path):
    try:
        with Image.open(src_path) as img:
            # Resize to 81x81 (3x density for 27px standard)
            img = img.resize((81, 81), Image.Resampling.LANCZOS)
            img.save(dest_path, "PNG", optimize=True)
            size = os.path.getsize(dest_path)
            print(f"Processed {os.path.basename(src_path)} -> {os.path.basename(dest_path)}: {size/1024:.2f}KB")
    except Exception as e:
        print(f"Error processing {src_path}: {e}")

# Find files and process
files = glob.glob(os.path.join(src_dir, "*.png"))
for f in files:
    name = os.path.basename(f)
    for key, final_name in mapping.items():
        # Check if key matches and it's not the "tab_icons_*" combined images
        if key in name and "tab_icons_" not in name:
            # Check exact match for inactive vs active to avoid confusion
            if "active" in key and "active" not in name:
                continue
            if "active" not in key and "active" in name:
                continue
                
            final_path = os.path.join(dest_dir, final_name)
            resize_image(f, final_path)
            break
