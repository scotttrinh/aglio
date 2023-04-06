CREATE MIGRATION m1vn3wxnp5txdnwvhjkezljxreyuclfdopxybjacdlg5rl5obkynwq
    ONTO m1r2mbzbzddi3a2vfduk2uq7x7zvdzeeszvjolwvnjq3x3ulqwcsma
{
  ALTER TYPE default::Sequence {
      CREATE REQUIRED LINK owner -> default::User {
          SET REQUIRED USING (std::assert_single((SELECT
              default::User 
          LIMIT
              1
          )));
      };
  };
  ALTER TYPE default::User {
      ALTER LINK sequences {
          USING (.<owner[IS default::Sequence]);
      };
  };
};
