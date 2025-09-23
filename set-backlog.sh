# save as: set-backlog.sh
#!/usr/bin/env bash
set -euo pipefail

ORG="NCS-Networks-Communication-Solution"
PROJ=1
REPO="ncs-ecom"

echo "[info] fetching project + field metadata"

PROJECT_ID=$(gh project view "$PROJ" --owner "$ORG" --format json | jq -r '.id')

FIELDS_JSON=$(gh project field-list "$PROJ" --owner "$ORG" --format json)

STATUS_FIELD_ID=$(jq -r '.fields[] | select(.name=="Status").id' <<<"$FIELDS_JSON")

# 🔑 v2 projects expose options under `configuration.options`
BACKLOG_ID=$(jq -r '.fields[] 
  | select(.name=="Status").configuration.options[] 
  | select(.name=="Backlog").id' <<<"$FIELDS_JSON")

if [ -z "$PROJECT_ID" ] || [ -z "$STATUS_FIELD_ID" ] || [ -z "$BACKLOG_ID" ]; then
  echo "[error] missing required IDs"
  exit 1
fi

echo "[info] project=$PROJECT_ID status_field=$STATUS_FIELD_ID backlog=$BACKLOG_ID"

echo "[info] adding issues and setting Status=Backlog"
for n in {2..11}; do
  echo "  - Processing issue #$n"
  ISSUE_URL="https://github.com/$ORG/$REPO/issues/$n"

  # Ensure item exists
  gh project item-add "$PROJ" --owner "$ORG" --url "$ISSUE_URL" --format json >/dev/null 2>&1 || true

  ITEM_ID=$(gh project item-list "$PROJ" --owner "$ORG" --format json |
    jq -r --arg repo "$REPO" --argjson num "$n" '
      .items[] 
      | select(.content.repository.name==$repo and .content.number==$num) 
      | .id' | head -n1)

  if [ -z "$ITEM_ID" ]; then
    echo "    [warn] no item for issue #$n"
    continue
  fi

  gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM_ID" \
    --field-id "$STATUS_FIELD_ID" --single-select-option-id "$BACKLOG_ID" || {
      echo "    [warn] edit failed for item $ITEM_ID"
    }
done

echo "[info] verify"
gh project item-list "$PROJ" --owner "$ORG" --format json |
  jq -r --arg repo "$REPO" '
    .items[] | select(.content.repository.name==$repo) |
    [.content.number, .content.title,
     ((.fieldValues // []) | map(select(.field.name=="Status"))[0].name // "No Status")] | @tsv'
