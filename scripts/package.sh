#!/bin/bash
# Assemble the YouTube release package in out/release/ and the project zip.
# Usage: scripts/package.sh airport CAKIR_Airport
set -e
EP=$1; SLUG=$2; R=out/release; mkdir -p $R
cp out/${SLUG}_FINAL.mp4 out/${SLUG}_Thumbnail.png $R/
cp episodes/$EP/build/${SLUG}_English.srt episodes/$EP/build/${SLUG}_Script.txt \
   episodes/$EP/build/${SLUG}_Asset_Licenses.csv episodes/$EP/build/${SLUG}_YouTube_Metadata.txt $R/
cp episodes/$EP/${SLUG}_Sources.md $R/
[ -f out/${SLUG}_QC_Report.md ] && cp out/${SLUG}_QC_Report.md $R/
# Project zip: everything needed to rebuild. Third-party media is excluded
# (re-fetched by the scripts; Coverr forbids redistributing raw files).
rm -f $R/${SLUG}_Project.zip
zip -qr $R/${SLUG}_Project.zip README.md docs package.json package-lock.json tsconfig.json remotion.config.ts \
  .gitignore src framework scripts episodes public/framework -x "*/__pycache__/*" "episodes/*/media/*"
ls -la $R
