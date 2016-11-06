grep -Eo '.com/.*/preowned' countries.txt  | cut -d / -f2 | sed 's/.*_//' | sort | uniq
