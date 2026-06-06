# TODO - Clixter Feature Work

## Reactions (emoji) for Posts + Comments (End-to-end)
- [ ] Inspect current comment UI component (CommentDialog.jsx) and post rendering (Posts.jsx)
- [ ] Update backend schemas: add reactions to Post model and Comment model
- [ ] Add backend controller endpoints to toggle emoji reactions for posts and comments
- [x] Update backend routes to expose reaction endpoints
- [x] Update frontend Posts.jsx to render reaction bar + counts and call reaction endpoints
- [x] Update frontend CommentDialog.jsx to render reaction bar + counts per comment and call reaction endpoints
- [ ] Verify state updates (Redux/global posts + local comments state)
- [ ] Manual test: reaction toggle, count updates, no regression for like/comment/bookmark


