#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAWFILE_DIR="$SCRIPT_DIR/../harmony/entry/src/main/resources/rawfile"
ASSETS_DIR="$RAWFILE_DIR/assets"
DEST_DIR="/data/app/el2/100/base/com.rnoh.tester/files/"

remove_all_files_in_dest() {
    hdc shell "rm -rf ${DEST_DIR}*"
    if [ $? -eq 0 ]; then
        echo "All files in $DEST_DIR have been removed successfully!"
    else
        echo "Error: Failed to remove files in $DEST_DIR"
        exit 1
    fi
}

send_files() {
    BUNDLE_FILE="$RAWFILE_DIR/bundle.harmony.js"
    if [ -f "$BUNDLE_FILE" ]; then
        hdc file send "$BUNDLE_FILE" "$DEST_DIR"
    else
        echo "Error: Bundle file not found at $BUNDLE_FILE"
        exit 1
    fi
    
    if [ -d "$ASSETS_DIR" ]; then
        for asset in "$ASSETS_DIR"/*; do
            if [ -f "$asset" ]; then
                hdc file send "$asset" "$DEST_DIR"
            fi
        done
    else
        echo "Error: Assets directory not found at $ASSETS_DIR"
        exit 1
    fi
    
    echo "All files have been sent successfully!"
}

if [ $# -eq 0 ]; then
    # No arguments passed - Just send files
    send_files
elif [ "$1" -eq 1 ]; then
    # Argument "1" passed - Remove and send files
    remove_all_files_in_dest
    send_files
elif [ "$1" -eq 2 ]; then
    # Argument "2" passed - Just remove files
    remove_all_files_in_dest
else
    echo "Invalid argument. Use '1' to remove and send, '2' to only remove, or no argument to just send."
    exit 1
fi
