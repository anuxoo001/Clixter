Post Scheduling

Backend tasks:
- Add `scheduledAt` field to `Post` model (optional `published` flag)
- Create API `POST /api/post/schedule` to create scheduled posts
- Background worker or cron to publish scheduled posts at `scheduledAt`
- Add authentication and validation

Frontend tasks:
- UI in `CreatePostDialog` to pick a publish date/time
- Validation for future date/time
- Show scheduled posts list in user profile

Notes:
- Use database TTL or background job (node-cron / agenda / bull) to publish.
