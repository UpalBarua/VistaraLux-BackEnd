import express from "express";
import passport from "passport";
const router = express.Router();
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONT_END_URL}/sign-in`
}), (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
});
export default router;
