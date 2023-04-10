CREATE MIGRATION m1fzwphcwfnot35y2ezpyjclme4hajnwfama7nqt4vqce2dj6keqza
    ONTO m1tgoj3q4mtfqxdgbe5iq73laqh7g6bsp6gge2h2bgn44ez2ngcb2a
{
  ALTER TYPE default::User {
      CREATE MULTI LINK playlists -> default::Playlist {
          ON SOURCE DELETE DELETE TARGET IF ORPHAN;
      };
  };
};
