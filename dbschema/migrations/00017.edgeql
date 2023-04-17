CREATE MIGRATION m1ieadsdxouk4rvx3xhj6n3cob6xt33xe7y6ckl5ztqlpe72tklpha
    ONTO m15gb4bflnt4wadqk5pyk4s532yudu5o4r34vo3eoslxp26w4bqkua
{
  CREATE FUTURE nonrecursive_access_policies;
  ALTER TYPE default::User {
      DROP LINK sequences;
  };
};
