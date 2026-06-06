Reactions & Emoji Reactions

Backend tasks:
- Create `Reaction` model linking `userId`, `postId`, and `type` (enum)
- APIs: add/remove reaction, get reactions per post
- Update post counts and emit socket events for real-time updates

Frontend tasks:
- UI for reacting (long-press or hover menu)
- Show counts and aggregated reaction summary
- Animate reaction interactions
