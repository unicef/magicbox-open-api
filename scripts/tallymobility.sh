#!/bin/bash

# color codes
orange=202
red=160
blue=33
green=34

# color echo message
function colored_echo {
  case $# in
    # just the message
    1) msg=$1
    ;;
    # message with foreground color
    2) msg="\\033[38;5;${2}m${1}\\033[0m"
    ;;
    # message with foreground and background color
    *) msg="\\033[48;5;${3};38;5;${2}m${1}\\033[0m"
    ;;
  esac

  echo -e "$msg"
}

# verify input
if [ $# -ne 1 ];
then
  colored_echo "Use: $0 <directory>" $red
  exit 1
fi

# directory where are the files
directory="$1"
# file pattern to match
file_pattern="^([0-9]{4}-[0-9]{2}-[0-9]{2})\.csv$"
# old working directory
old_wd=`pwd`

colored_echo "Searching files in $1" $green

# enter in directory
cd $directory

# get all .csv files in current directory
for file in `ls *.csv`; do
  # if the current file matches our pattern
  if [[ $file =~ $file_pattern ]];
  then
    # process it
    sum=(`awk -F, '{ journeys_sum += $3; people_sum += $4 } END { print journeys_sum, people_sum }' $file`)
    # new file name
    new_file="${BASH_REMATCH[1]}^${sum[0]}-${sum[1]}.csv"
    # rename file
    mv $file "${BASH_REMATCH[1]}^${sum[0]}-${sum[1]}.csv"
    # show processed information
    colored_echo "old file: ${file}, journeys: ${sum[0]}, people: ${sum[1]}, new file: ${new_file}" $green
  else
    # ignore it
    colored_echo "Ignoring: $file" $orange
  fi
done

# return to previous working directory
cd $old_wd

colored_echo "Done!" $green

exit 0

