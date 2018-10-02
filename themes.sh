#!/usr/bin/env bash

###############################
##                            #
## Add default to variables   #
##                            #
###############################

CONFIG='config.yml'
TEMP_DIR='temp'
TEMP_THEME_NAME="BACKUP - LIVE - $(date +%Y/%m/%d,%H:%M:%S)"
CLEANSE=false
BACKUP_THEMES_KEEP=3
CREATE_STAGING_THEME=false
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD | cut -d '/' -f2)"
IFS=','

# These variable will come out of config.yml parsing
development_api_key="$SHOPIFY_API_KEY"
development_password="$SHOPIFY_PASSWORD"
development_store="$SHOPIFY_STORE"

###############################
##                            #
## Handle Arguments           #
##                            #
###############################

for i in "$@"; do
case $i in
    --config=*)
    CONFIG="${i#*=}"
    shift # past argument=value
    ;;
    --temp-dir=*)
    TEMP_DIR="${i#*=}"
    shift # past argument=value
    ;;
    --temp-theme=*)
    TEMP_THEME_NAME="${i#*=}"
    shift # past argument=value
    ;;
    --cleanse)
    CLEANSE=true
    shift # past argument=value
    ;;
    --stage|--staging)
    CREATE_STAGING_THEME=true
    TEMP_THEME_NAME="STAGE - $(git rev-parse --abbrev-ref HEAD | cut -d "/" -f2)"
    shift # past argument=value
    ;;
    *)
	  echo "Unknown option: ${i#*=}"
    # unknown option
    ;;
esac
done

###############################
##                            #
## Helper functions           #
##                            #
###############################

# Parses all remote branches into an array
function get_remote_branches {
  IFS=' '
  REMOTE_BRANCHES=()
  BRANCHES_AS_STRING="$(git branch -r | xargs)"
  read -r -a BRANCHES <<< "$BRANCHES_AS_STRING"
  for element in "${BRANCHES[@]}"
  do
    REMOTE_BRANCHES+=("${element##*/}")
  done
  IFS=','
  echo "${REMOTE_BRANCHES[*]}"
}

## Parse a yaml file
function parse_yaml {
   local prefix=$2
   local s='[[:space:]]*' w='[a-zA-Z0-9_]*' fs=$(echo @|tr @ '\034')
   sed -ne "s|^\($s\):|\1|" \
        -e "s|^\($s\)\($w\)$s:$s[\"']\(.*\)[\"']$s\$|\1$fs\2$fs\3|p" \
        -e "s|^\($s\)\($w\)$s:$s\(.*\)$s\$|\1$fs\2$fs\3|p"  $1 |
   awk -F$fs '{
      indent = length($1)/2;
      vname[indent] = $2;
      for (i in vname) {if (i > indent) {delete vname[i]}}
      if (length($3) > 0) {
         vn=""; for (i=0; i<indent; i++) {vn=(vn)(vname[i])("_")}
         printf("export %s%s%s=\"%s\" ", "'$prefix'",vn, $2, $3);
      }
   }'
}

# Make a network request to Shopify
function request {
  curl \
  -u "$1:$2" \
  -H "Accept: application/json" \
  -H "Content-Type:application/json" \
  --data "$5" \
  -X $4 "https://$3" 2> /dev/null
}

# Turn all themes json into a pretty string
function get_all_themes_from_json {
  node -e "\
    const json = JSON.parse('$1');\
    const string = json.themes.map(obj => obj['id'] + ':' + obj['role']).join(',');
    console.log(string)";
}

# Downloads themekit
function download_themekit {
  if ! [ -x "$(command -v theme)" ]; then
    echo -e "\nDownloading Shopify Themekit..\n"
    brew tap shopify/shopify
    brew install themekit
  fi;
}

# Downloads the published theme
function download_main_theme {
  echo -e "\nCleaning temp directory if it already exists..\n"
  if  [ -d "$TEMP_DIR" ]; then
    rm -r "$TEMP_DIR"
  fi

  echo -e "\nMaking temp directory and entering it..\n"
  mkdir "$TEMP_DIR"

  echo -e "\nDownloading published theme into temp directory..\n"
  theme download \
    --password="$development_password" \
    --store="$development_store" \
    --themeid="$1" \
    --dir="$TEMP_DIR"
}

# Get all themes to delete
# Filter out non-backup themes. Sort them via updated date.
# Keep a certain amount of them (via BACKUP_THEMES_KEEP)
function get_themes_to_delete_from_json {

  # Here, we get all of the active remote branches and
  # look for all staging themes (include stage or staging)
  # in the title. Then, we look for all staging themes
  # that do not have an active branch name in the title
  # (and ignore published themes)
  if [ "$CREATE_STAGING_THEME" = true ]; then
    node -e "
      const json = JSON.parse('$1');
      const activeBranches = '$(get_remote_branches)'.split(',').filter(branch => {
        if (~['HEAD', '->', 'master'].indexOf(branch)) {
          return false
        }
        if (branch.length < 5) {
          return false
        }
        return true
      })
      const stagingThemes = json.themes.filter(obj => /stage|staging/i.test(obj.name))
      const toDelete = stagingThemes
        .filter(obj => {
          if (/keep/i.test(obj.name)) {
            return false
          }
          return !activeBranches.some(branch => {
            const regex = new RegExp(branch, 'i')
            return regex.test(obj.name)
          })
        })
        .filter(obj => obj.role === 'unpublished')
      const string = toDelete.map(obj => obj.id).join(',')
      console.log(string)";
  else
    node -e "
      const json = JSON.parse('$1');
      const backupThemes = json.themes
        .filter(obj => /back[ -_]?up/i.test(obj.name))
        .filter(obj => obj.role === 'unpublished')
      const backupThemesSorted = backupThemes.sort((a, b) => {
        const date1 = new Date(a['updated_at'])
        const date2 = new Date(b['updated_at'])
        if (date1 > date2) return -1;
        if (date1 < date2) return 1;
        return 0;
      });
      const toDelete = backupThemesSorted.slice($BACKUP_THEMES_KEEP)
      const string = toDelete.map(obj => obj.id).join(',')
      console.log(string)";
  fi
}

# Deletes a theme from Shopify
function delete_theme {
  # Create new theme
  echo -e "\nDeleting theme $1..\n"
  DELETED_THEME_JSON="$(
    request \
      "$development_api_key" \
      "$development_password" \
      "$development_store/admin/themes/$1.json" \
      "DELETE"
  )"

  echo "$DELETED_THEME_JSON"
}

function get_existing_theme {
  # CURRENT_BRANCH
  node -e "
    const json = JSON.parse('$1');
    const currentBranch = '$CURRENT_BRANCH';
    const themesSorted = json.themes.sort((a, b) => {
      const date1 = new Date(a['updated_at'])
      const date2 = new Date(b['updated_at'])
      if (date1 > date2) return -1;
      if (date1 < date2) return 1;
      return 0;
    });
    const existing = themesSorted.find(theme => {
      const regex = new RegExp(currentBranch, 'i')
      return regex.test(theme.name)
    })
    if (existing) {
      console.log(existing.id)
    }
    ";
}

# Returns the theme id
function get_theme_id {
  node -e "\
    const json = JSON.parse('$1');\
    const string = json.theme.id;\
    console.log(string)";
}

# Upload the temp directory to the theme
function upload_theme {
  echo -e "\nUploading the temp directory to new theme..\n"
  theme upload \
    --password="$development_password" \
    --store="$development_store" \
    --themeid="$1" \
    --dir="$TEMP_DIR"
}

###############################
##                            #
## EXECUTION!!!!!!!!          #
##                            #
###############################

# Makes sure that themekit is installed
download_themekit

# Create an empty yaml file if doesn't exit
if ! [ -f "$CONFIG" ]; then
  touch "$CONFIG"
fi

# Parse the config.yml file
if ! [ "$GITLAB_CI" ]; then
  eval $(parse_yaml "$CONFIG")
fi

# Get all active themes
ALL_THEMES_JSON="$(
  request \
    "$development_api_key" \
    "$development_password" \
    "$development_store/admin/themes.json" \
    "GET"
)"

# Parse out JSON and turn it into a nice clean string
# with following format: <id>:<role>,<id>:<role>
ALL_THEMES_STRING=$(get_all_themes_from_json "$ALL_THEMES_JSON")

# Turn ALL_THEMES_STRING into an array
IFS=','
read -r -a THEMES <<< "$ALL_THEMES_STRING"

# Attempt to find existing theme to upload to
EXISTING_THEME=$(get_existing_theme "$ALL_THEMES_JSON")

# Get the id of the published theme and download it
if ! [ "$EXISTING_THEME" ]; then
  for element in "${THEMES[@]}"
  do
    if [[ $element = *"main"* ]]; then
      download_main_theme "${element%%:*}"
    fi
  done
fi

# IF -cleanse flag is passed, delete oldest backup files, keeping some
if [ "$CLEANSE" = true ]; then

  # Parse existing JSON to find themes to delete
  THEMES_TO_DELETE_STRING=$(get_themes_to_delete_from_json "$ALL_THEMES_JSON")

  # Turn into an array
  IFS=','
  read -r -a THEMES_TO_DELETE <<< "$THEMES_TO_DELETE_STRING"

  for element in "${THEMES_TO_DELETE[@]}"
  do
    delete_theme "$element"
  done
fi

# Get all themes again
ALL_THEMES_STRING=$(get_all_themes_from_json "$ALL_THEMES_JSON")

# Turn into an array
read -r -a THEMES <<< "$ALL_THEMES_STRING"

if ! [[ "${#THEMES[@]}" < 20 ]]; then
  echo -e "\nWARNING: Store is at it's 20 theme limit\n"
  exit 1;
fi

if [ "$CREATE_STAGING_THEME" = false ] || ! [ "$EXISTING_THEME" ]; then
  # Create new empty theme
  echo -e "\nCreating new empty theme: $TEMP_THEME_NAME..\n"
  NEW_THEME_JSON="$(
    request \
      "$development_api_key" \
      "$development_password" \
      "$development_store/admin/themes.json" \
      "POST" \
      "{\"theme\": {\"name\": \"$TEMP_THEME_NAME\"} }"
  )"
  NEW_THEME_ID=$(get_theme_id "$NEW_THEME_JSON")
  upload_theme "$NEW_THEME_ID"
fi

echo -e "\nAll done!!"
