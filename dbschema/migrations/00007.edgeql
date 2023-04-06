CREATE MIGRATION m1r2mbzbzddi3a2vfduk2uq7x7zvdzeeszvjolwvnjq3x3ulqwcsma
    ONTO m1fy342rmgxbqfcgmmdnq4q2nutkjepx5wnkjhkbhzh6mf72gwxdrq
{
  ALTER TYPE default::Sequence {
      ALTER LINK steps {
          ON SOURCE DELETE DELETE TARGET IF ORPHAN;
      };
  };
  ALTER TYPE default::Step {
      ALTER LINK audio {
          ON SOURCE DELETE DELETE TARGET IF ORPHAN;
      };
  };
  ALTER TYPE default::Step {
      ALTER LINK video {
          ON SOURCE DELETE DELETE TARGET IF ORPHAN;
      };
  };
};
