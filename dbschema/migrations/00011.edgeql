CREATE MIGRATION m1zpesierj6quq4a4qfg4skdg4iiiqu4mxrsgiexoiy67bahe4wufq
    ONTO m1fzwphcwfnot35y2ezpyjclme4hajnwfama7nqt4vqce2dj6keqza
{
  CREATE SCALAR TYPE default::Behavior EXTENDING enum<PAUSES_VIDEO, PAUSES_AUDIO>;
  ALTER TYPE default::Step {
      CREATE REQUIRED PROPERTY behaviors -> array<default::Behavior> {
          SET REQUIRED USING (SELECT
              <array<default::Behavior>>[]
          );
      };
  };
};
