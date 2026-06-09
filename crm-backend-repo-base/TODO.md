- [ ] Update api/leads.ts to remove ad-hoc CREATE TABLE/ALTER logic
- [ ] Make POST/PUT/DELETE id handling safe (do not pass alphanumeric ids into integer columns)
- [ ] Add defensive validation and return 400 on type mismatch
- [ ] Smoke-test POST/PUT/DELETE once the server is running

