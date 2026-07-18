#!/bin/bash

# Video speedup script: resizes to width 700, compresses to 100 frames at 10fps

if [ $# -lt 1 ]; then
    echo "Usage: $0 input_video.mp4 [output_video.mp4]"
    echo ""
    echo "Resizes video to width 700 and speeds it up to exactly 100 frames at 10fps"
    exit 1
fi

INPUT="$1"
OUTPUT="${2:-output.mp4}"

# Check if input file exists
if [ ! -f "$INPUT" ]; then
    echo "Error: Input file '$INPUT' not found"
    exit 1
fi

echo "Getting frame count from $INPUT..."
FRAMES=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$INPUT")

if [ -z "$FRAMES" ] || [ "$FRAMES" = "N/A" ]; then
    echo "Error: Could not determine frame count"
    exit 1
fi

echo "Original frames: $FRAMES"

# Calculate speedup factor
FACTOR=$(echo "scale=2; $FRAMES / 100" | bc)
echo "Speedup factor: ${FACTOR}x"
echo ""
echo "Processing video..."
echo "Output: $OUTPUT (100 frames at 10fps = 10 seconds)"
echo ""

# Run ffmpeg with calculated speedup
ffmpeg -i "$INPUT" -an -vf "scale=700:-1,setpts=PTS/${FACTOR},fps=10" -vframes 100 -c:v libx265 -crf 18 "$OUTPUT"

echo ""
echo "Done! Video saved to $OUTPUT"