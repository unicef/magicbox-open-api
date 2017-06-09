#!/bin/bash
cd "$(git rev-parse --show-toplevel)"
ESLINT="node_modules/.bin/eslint"
pwd

if [[ ! -x "$ESLINT" ]]; then
  printf "\t\033[41mPlease install ESlint\033[0m (npm install eslint)\n"
  exit 1
fi

STAGED_FILES=($(git diff --cached --name-only --diff-filter=ACM | grep ".jsx\{0,1\}$"))

echo "ESLint'ing ${#STAGED_FILES[@]} files"

if [[ "$STAGED_FILES" = "" ]]; then
  exit 0
fi

failed=0
for file in ${STAGED_FILES}; do
  git show :$file | $ESLINT --stdin --stdin-filename "$file"
  if [[ $? != 0 ]] ; then
    failed=1
  fi
done;

# Re-add files since they may have been fixed
# git add "${STAGED_FILES[@]}"

if [[ $failed == 0 ]]; then
  printf "\n\033[42mCOMMIT SUCCEEDED\033[0m\n"
  exit 0
else
  printf "\n\033[41mCOMMIT FAILED:\033[0m Fix eslint errors and try again\n"
  exit 1
fi
#
# exit $?
