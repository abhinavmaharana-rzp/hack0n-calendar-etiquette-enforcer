# Calendar Etiquette Enforcer - Google Workspace Add-on

This add-on enforces agenda requirements on Google Calendar events.

## Setup

1. Install clasp:
```bash
npm install -g @google/clasp
```

2. Login to Google:
```bash
clasp login
```

3. Create the add-on project:
```bash
clasp create --type addon --title "Calendar Etiquette Enforcer"
```

4. Update backend URL in Code.gs line 25

5. Deploy:
```bash
clasp push
clasp deploy --description "v1.0"
```

## Testing

1. Open Google Calendar
2. Create a new event
3. Add-on should appear in sidebar
4. Fill in agenda and save

## Troubleshooting

- Check logs: `clasp logs`
- Open in editor: `clasp open`
- Clear cache and reload calendar