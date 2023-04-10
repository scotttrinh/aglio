CREATE MIGRATION m1tgoj3q4mtfqxdgbe5iq73laqh7g6bsp6gge2h2bgn44ez2ngcb2a
    ONTO m1vn3wxnp5txdnwvhjkezljxreyuclfdopxybjacdlg5rl5obkynwq
{
  ALTER TYPE default::Step {
      DROP LINK audio;
      DROP LINK video;
  };
};
