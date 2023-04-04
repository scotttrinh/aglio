CREATE MIGRATION m1xzwqep65ajwemttrdh6ke2kmspiu4r6xau4ovdrpaxfcaavbhrkq
    ONTO m16wwakksmrwkqyp5e7xuo4hwyrlrxdjaqvgcigl6k7fldwln4622a
{
  ALTER TYPE default::User {
      CREATE PROPERTY email_verified -> std::datetime;
  };
};
