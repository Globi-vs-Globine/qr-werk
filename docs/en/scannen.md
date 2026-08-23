# Scanning

## Camera and batch scanning
Use the single scanner to inspect one result immediately. Use **Batch scan** for several codes without returning to the overview after every scan. The keyboard button allows manual entry when a damaged label cannot be read.

Scanner controls include the torch, 1×/2× zoom, manual entry, scan area and scan filter. **Standard** suits QR codes, **Wide** suits long barcodes, and **Full image** helps when a code cannot be positioned precisely.

## Duplicate codes and scan pause
Under **Settings → QR and scan settings**, choose whether duplicates are allowed, blocked only during the current batch, or compared with the complete history. The default one-second pause prevents the same label being captured repeatedly. Autofocus should normally remain enabled.

## Scan filter
The filter defines the required structure of accepted codes:
- **Starts with (prefix):** required beginning, such as `CF`
- **Ends with (suffix):** required ending, such as `99`
- **Exact character count:** total length, such as `20`

All completed conditions must match. The character-count field contains only a number; it does not search for one exact asset code. Filters apply to camera scans, batch scans, image import and manual input.

## Image import
Select one or more images. QR Werk can detect multiple codes per image. Review the results, select the wanted values and save all or only the selection.
